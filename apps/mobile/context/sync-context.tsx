import { useSession } from '@/context/auth-context';
import { useMlsBridge } from '@/context/mls-context';
import { authClient } from '@/lib/auth-client';
import { api, API_URL } from '@/lib/api-client';
import { bytesToBase64Url } from '@/lib/base64';
import { SyncClient } from '@repo/client-core';
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import * as SecureStore from 'expo-secure-store';

export type RawMessage = {
  id: string;
  chatId: string;
  senderUserId: string;
  senderDeviceId: string;
  mlsEpoch: number;
  ciphertext: string;
  contentType: string;
  createdAt: string;
};

type SyncStore = {
  messagesByChat: Record<string, RawMessage[]>;
  /** Bumps on every inbound message, so the chat list knows to refetch /chats. */
  chatsVersion: number;
  addLocalMessage: (message: RawMessage) => void;
  /** This session's registered MLS device — null until bootstrap completes. */
  deviceId: string | null;
};

const SyncContext = createContext<SyncStore | null>(null);

export function useSyncStore(): SyncStore {
  const value = use(SyncContext);
  if (!value) {
    throw new Error('useSyncStore must be used within a <SyncProvider />');
  }
  return value;
}

// Reserved bridge key for this device's own key-package generation, which
// (unlike group ops) isn't actually chat-scoped — see context/mls-context.tsx.
const DEVICE_PARTY_KEY = '__self__';
const KEY_PACKAGE_POOL_SIZE = 5;

async function ensureDeviceRegistered(
  userId: string,
  mlsBridge: ReturnType<typeof useMlsBridge>,
): Promise<string> {
  await mlsBridge.createParty(DEVICE_PARTY_KEY, userId);
  const { device_id } = await api.registerDevice(
    bytesToBase64Url(new Uint8Array([1])),
  );
  for (let i = 0; i < KEY_PACKAGE_POOL_SIZE; i++) {
    const keyPackageBytes =
      await mlsBridge.generateKeyPackage(DEVICE_PARTY_KEY);
    await api.uploadKeyPackage(device_id, bytesToBase64Url(keyPackageBytes));
  }
  return device_id;
}

export function SyncProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const mlsBridge = useMlsBridge();
  const syncClientRef = useRef<SyncClient | null>(null);
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, RawMessage[]>
  >({});
  const [chatsVersion, setChatsVersion] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const addMessage = (message: RawMessage) => {
    setMessagesByChat((prev) => {
      const existing = prev[message.chatId] ?? [];
      if (existing.some((entry) => entry.id === message.id)) {
        return prev;
      }
      return { ...prev, [message.chatId]: [...existing, message] };
    });
  };

  useEffect(() => {
    if (!session || !mlsBridge.ready) {
      return;
    }

    let cancelled = false;
    const cursorKey = `sync-cursor-${session.userId}`;

    const client = new SyncClient(
      { backendUrl: API_URL, headers: { Cookie: authClient.getCookie() } },
      async (event) => {
        if (event.event_type === 'message.created') {
          const message = await api.getMessage(event.entity_id);
          if (cancelled) {
            return;
          }
          addMessage({
            id: message.message_id,
            chatId: message.chat_id,
            senderUserId: message.sender_user_id,
            senderDeviceId: message.sender_device_id,
            mlsEpoch: message.mls_epoch,
            ciphertext: message.ciphertext,
            contentType: message.content_type,
            createdAt: message.created_at,
          });
          setChatsVersion((version) => version + 1);
        }
        await SecureStore.setItemAsync(cursorKey, event.cursor);
      },
    );
    syncClientRef.current = client;

    void ensureDeviceRegistered(session.userId, mlsBridge)
      .then((registeredDeviceId) => {
        if (!cancelled) {
          setDeviceId(registeredDeviceId);
        }
      })
      .catch((error) => {
        console.error('failed to register MLS device/key packages:', error);
      });

    void (async () => {
      const storedCursor = (await SecureStore.getItemAsync(cursorKey)) ?? '0';
      if (cancelled) {
        return;
      }
      await client.connect(storedCursor);
    })().catch((error) => {
      console.error('sync client failed to connect:', error);
    });

    return () => {
      cancelled = true;
      client.disconnect();
      syncClientRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.userId, mlsBridge.ready]);

  return (
    <SyncContext.Provider
      value={{
        messagesByChat,
        chatsVersion,
        addLocalMessage: addMessage,
        deviceId,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
