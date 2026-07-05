import type { edenTreaty } from '@elysiajs/eden';
import type { App } from '@app/api-gateway';
import {
  PROTOCOL_VERSION,
  type Cursor,
  type UserEventEnvelope,
} from '@repo/sync-protocol';

export type SyncClientState =
  | 'disconnected'
  | 'connecting'
  | 'catching_up'
  | 'live';

export type SyncClientEventHandler = (
  event: UserEventEnvelope,
) => void | Promise<void>;

export interface SyncClientOptions {
  apiClient: ReturnType<typeof edenTreaty<App>>;
  /** Page size for the catch-up fetch loop. Defaults to the protocol max. */
  syncLimit?: number;
  onStateChange?: (state: SyncClientState) => void;
  /** Called when applying a *live* event throws; catch-up errors instead reject `connect()`. */
  onError?: (error: unknown) => void;
}

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30_000;

export class SyncClient {
  private readonly apiClient: ReturnType<typeof edenTreaty<App>>;
  private readonly syncLimit: number;
  private readonly onEvent: SyncClientEventHandler;
  private readonly onStateChange?: (state: SyncClientState) => void;
  private readonly onError?: (error: unknown) => void;

  private state: SyncClientState = 'disconnected';
  private ws: { send: (data: string) => void; close: () => void } | null = null;
  private lastAppliedCursor: Cursor = '0';
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByCaller = false;

  constructor(options: SyncClientOptions, onEvent: SyncClientEventHandler) {
    this.apiClient = options.apiClient;
    this.syncLimit = options.syncLimit ?? 500;
    this.onEvent = onEvent;
    this.onStateChange = options.onStateChange;
    this.onError = options.onError;
  }

  getState(): SyncClientState {
    return this.state;
  }

  async connect(lastAckCursor: Cursor): Promise<void> {
    this.closedByCaller = false;
    this.lastAppliedCursor = lastAckCursor;
    this.setState('connecting');

    const required = await this.checkGap(lastAckCursor);
    if (required !== null) {
      this.setState('catching_up');
      await this.fetchLoop(required);
    }

    await this.openSocket();
    this.setState('live');
  }

  disconnect(): void {
    this.closedByCaller = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.setState('disconnected');
  }

  async ack(cursor: Cursor): Promise<void> {
    const response = await this.apiClient.ack.post({
      version: PROTOCOL_VERSION,
      last_ack_cursor: cursor,
    });
    if (response.error) {
      throw new Error(
        `ack failed: ${response.error.status} ${JSON.stringify(response.error.value)}`,
      );
    }
  }

  private async checkGap(afterCursor: Cursor): Promise<Cursor | null> {
    const page = await this.fetchSyncPage(afterCursor, 1);
    return page.has_more || page.events.length > 0 ? afterCursor : null;
  }

  private async fetchSyncPage(afterCursor: Cursor, limit: number) {
    const response = await this.apiClient.sync.post({
      version: PROTOCOL_VERSION,
      after_cursor: afterCursor,
      limit,
    });

    if (response.error) {
      throw new Error(
        `sync failed: ${response.error.status} ${JSON.stringify(response.error.value)}`,
      );
    }

    return response.data as {
      events: UserEventEnvelope[];
      next_cursor: Cursor;
      has_more: boolean;
    };
  }

  private async fetchLoop(afterCursor: Cursor): Promise<void> {
    let cursor = afterCursor;
    for (;;) {
      const page = await this.fetchSyncPage(cursor, this.syncLimit);

      for (const event of page.events) {
        await this.onEvent(event);
        this.lastAppliedCursor = event.cursor;
      }

      if (page.events.length > 0) {
        await this.ack(this.lastAppliedCursor);
      }

      cursor = page.next_cursor;
      if (!page.has_more) {
        return;
      }
    }
  }

  private async openSocket(): Promise<void> {
    // 1. Get single-use token
    const tokenResponse = await this.apiClient['ws-token'].post({});
    if (tokenResponse.error) {
      throw new Error(
        `Failed to get WS token: ${tokenResponse.error.status} ${JSON.stringify(tokenResponse.error.value)}`,
      );
    }
    const token = (tokenResponse.data as { token: string }).token;

    // 2. Connect
    return new Promise((resolve) => {
      const ws = this.apiClient.ws.subscribe({ $query: { token } });
      this.ws = ws;

      // EdenWS .on listeners:
      ws.on('open', () => {
        ws.send(
          JSON.stringify({
            type: 'client.hello',
            version: PROTOCOL_VERSION,
            last_ack_cursor: this.lastAppliedCursor,
          }),
        );

        this.setState('live');
        resolve();
        this.reconnectAttempt = 0;
      });

      ws.on('message', (event: { data: unknown }) => {
        void this.handleSocketMessage(event.data);
      });

      ws.on('close', () => {
        this.ws = null;
        if (!this.closedByCaller) {
          this.scheduleReconnect();
        }
      });
    });
  }

  private async handleSocketMessage(message: unknown): Promise<void> {
    // Eden Treaty may automatically parse JSON
    const parsed = typeof message === 'string' ? JSON.parse(message) : message;

    if (parsed.type === 'server.sync.required') {
      this.setState('catching_up');
      try {
        await this.fetchLoop(parsed.required_after_cursor);
      } catch (error) {
        this.onError?.(error);
        return;
      }
      this.setState('live');
      return;
    }

    if (parsed.type === 'event.notify') {
      try {
        await this.onEvent(parsed.event);
        this.lastAppliedCursor = parsed.event.cursor;
        await this.ack(this.lastAppliedCursor);
      } catch (error) {
        this.onError?.(error);
      }
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(
      INITIAL_BACKOFF_MS * 2 ** this.reconnectAttempt,
      MAX_BACKOFF_MS,
    );
    const jitter = delay * (0.5 + Math.random() * 0.5);
    this.reconnectAttempt += 1;

    this.reconnectTimer = setTimeout(() => {
      void this.connect(this.lastAppliedCursor).catch((error) => {
        this.onError?.(error);
        this.scheduleReconnect();
      });
    }, jitter);
  }

  private setState(state: SyncClientState): void {
    this.state = state;
    this.onStateChange?.(state);
  }
}

export { PROTOCOL_VERSION };
