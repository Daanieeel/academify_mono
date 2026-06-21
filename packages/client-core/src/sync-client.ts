import {
  createAckRequestDto,
  createClientHello,
  createSyncRequestDto,
  parseWsMessage,
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
  /** Gateway base URL, e.g. `http://localhost:3001`. */
  backendUrl: string;
  /**
   * Extra headers for REST + WS requests. In a browser this is normally
   * unnecessary (cookies attach automatically); a non-browser caller (tests,
   * a headless worker) passes `{ Cookie: '...' }` here instead.
   */
  headers?: Record<string, string>;
  fetchImpl?: typeof fetch;
  webSocketImpl?: typeof WebSocket;
  /** Page size for the catch-up fetch loop. Defaults to the protocol max. */
  syncLimit?: number;
  onStateChange?: (state: SyncClientState) => void;
  /** Called when applying a *live* event throws; catch-up errors instead reject `connect()`. */
  onError?: (error: unknown) => void;
}

const INITIAL_BACKOFF_MS = 500;
const MAX_BACKOFF_MS = 30_000;

/**
 * Reference implementation of the client sync state machine (README §3,
 * Ticket 1.8): CONNECT -> HELLO -> (SYNC_REQUIRED?) -> FETCH_LOOP -> APPLY ->
 * ACK -> LIVE. Shared shape for web/mobile; this module has no DOM/RN
 * dependency, only `fetch` + `WebSocket` (both injectable for testing).
 *
 * Decryption is the caller's job: `onEvent` receives the envelope (metadata
 * only) and decides what to do per `event_type` — e.g. for `message.created`,
 * fetch `GET /messages/:id` and decrypt with `@repo/mls` before persisting.
 */
export class SyncClient {
  private readonly backendUrl: string;
  private readonly headers: Record<string, string>;
  private readonly fetchImpl: typeof fetch;
  private readonly webSocketImpl: typeof WebSocket;
  private readonly syncLimit: number;
  private readonly onEvent: SyncClientEventHandler;
  private readonly onStateChange?: (state: SyncClientState) => void;
  private readonly onError?: (error: unknown) => void;

  private state: SyncClientState = 'disconnected';
  private ws: WebSocket | null = null;
  private lastAppliedCursor: Cursor = '0';
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByCaller = false;

  constructor(options: SyncClientOptions, onEvent: SyncClientEventHandler) {
    this.backendUrl = options.backendUrl.replace(/\/$/, '');
    this.headers = options.headers ?? {};
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.webSocketImpl = options.webSocketImpl ?? WebSocket;
    this.syncLimit = options.syncLimit ?? 500;
    this.onEvent = onEvent;
    this.onStateChange = options.onStateChange;
    this.onError = options.onError;
  }

  getState(): SyncClientState {
    return this.state;
  }

  /** CONNECT -> HELLO -> catch-up -> LIVE. Resolves once catch-up completes. */
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
    await this.postJson(
      '/ack',
      createAckRequestDto({ last_ack_cursor: cursor }),
    );
  }

  // A plain REST gap-check before opening the socket — equivalent to what
  // `client.hello` over WS would also tell us, but lets connect() do the
  // catch-up fetch loop before LIVE rather than racing it against the socket.
  private async checkGap(afterCursor: Cursor): Promise<Cursor | null> {
    const page = await this.fetchSyncPage(afterCursor, 1);
    return page.has_more || page.events.length > 0 ? afterCursor : null;
  }

  private async fetchSyncPage(
    afterCursor: Cursor,
    limit: number,
  ): Promise<{
    events: UserEventEnvelope[];
    next_cursor: Cursor;
    has_more: boolean;
  }> {
    return this.postJson(
      '/sync',
      createSyncRequestDto({ after_cursor: afterCursor, limit }),
    );
  }

  // FETCH_LOOP -> APPLY -> ACK, repeated until caught up. Stops (without
  // acking the failing batch) if `onEvent` throws, so a decrypt failure can't
  // silently advance the ack past undelivered data.
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
    return new Promise((resolve, reject) => {
      const wsUrl = `${this.backendUrl.replace(/^http/, 'ws')}/ws`;
      const ws = new this.webSocketImpl(wsUrl, {
        headers: this.headers,
      } as never);
      this.ws = ws;
      let settled = false;

      ws.addEventListener('open', () => {
        ws.send(
          JSON.stringify(
            createClientHello({ last_ack_cursor: this.lastAppliedCursor }),
          ),
        );
        if (!settled) {
          settled = true;
          resolve();
        }
        this.reconnectAttempt = 0;
      });

      ws.addEventListener('message', (event: MessageEvent) => {
        void this.handleSocketMessage(String(event.data));
      });

      ws.addEventListener('close', () => {
        this.ws = null;
        if (!this.closedByCaller) {
          this.scheduleReconnect();
        }
      });

      ws.addEventListener('error', (event) => {
        if (!settled) {
          settled = true;
          reject(event);
        }
      });
    });
  }

  private async handleSocketMessage(raw: string): Promise<void> {
    const message = parseWsMessage(JSON.parse(raw));

    if (message.type === 'server.sync.required') {
      this.setState('catching_up');
      try {
        await this.fetchLoop(message.required_after_cursor);
      } catch (error) {
        this.onError?.(error);
        return;
      }
      this.setState('live');
      return;
    }

    if (message.type === 'event.notify') {
      try {
        await this.onEvent(message.event);
        this.lastAppliedCursor = message.event.cursor;
        await this.ack(this.lastAppliedCursor);
      } catch (error) {
        this.onError?.(error);
      }
    }
  }

  // Exponential backoff with jitter, capped at MAX_BACKOFF_MS. Reconnect
  // restarts from CONNECT (gap-check + catch-up), not just the socket, since
  // events may have arrived while disconnected.
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

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const response = await this.fetchImpl(`${this.backendUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(
        `${path} failed: ${response.status} ${await response.text()}`,
      );
    }

    return response.json() as Promise<T>;
  }
}

export { PROTOCOL_VERSION };
