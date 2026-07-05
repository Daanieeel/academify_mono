import { useSession } from '@/context/auth-context';
import { useMlsBridge } from '@/context/mls-context';
import { useSyncStore, type RawMessage } from '@/context/sync-context';
import { api } from '@/lib/api-client';

type GetManyChatMessagesDto = NonNullable<
  Awaited<ReturnType<(typeof api.chats)['']['messages']['get']>>
>['data'];
type SingleChatMessageDto = NonNullable<GetManyChatMessagesDto>['messages'][0];
import { base64UrlToBytes, bytesToBase64Url } from '@/lib/base64';
import * as ExpoCrypto from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';

// Matches crates/mls-wasm's CIPHERSUITE constant — metadata only, the
// Delivery Service doesn't validate it (see apps/api-gateway/src/routes/mls.ts).
const CIPHER_SUITE = 'MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519';

export type ChatMessage = {
  id: string;
  senderUserId: string;
  text: string;
  createdAt: string;
};

function toRawMessage(message: SingleChatMessageDto): RawMessage {
  return {
    id: message.message_id,
    chatId: message.chat_id,
    senderUserId: message.sender_user_id,
    senderDeviceId: message.sender_device_id,
    mlsEpoch: message.mls_epoch,
    ciphertext: message.ciphertext,
    contentType: message.content_type,
    createdAt: message.created_at,
  };
}

function mergeById(a: RawMessage[], b: RawMessage[]): RawMessage[] {
  const byId = new Map<string, RawMessage>();
  for (const message of [...a, ...b]) {
    byId.set(message.id, message);
  }
  return [...byId.values()];
}

export function useChatThread(chatId: string) {
  const { session } = useSession();
  const mlsBridge = useMlsBridge();
  const { messagesByChat, addLocalMessage, deviceId } = useSyncStore();

  const [peer, setPeer] = useState<{
    user_id: string;
    display_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mlsError, setMlsError] = useState<string | null>(null);
  const [groupEstablished, setGroupEstablished] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [plaintextById, setPlaintextById] = useState<Record<string, string>>(
    {},
  );
  const [history, setHistory] = useState<RawMessage[]>([]);
  const partyCreatedRef = useRef(false);

  // Load chat metadata + history once, and join an already-existing group
  // (someone else created it before we ever opened this chat) eagerly so
  // incoming messages can be decrypted as soon as they arrive.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: detail, error: detailError } =
        await api.chats[chatId].get();
      if (detailError) {
        throw detailError;
      }
      if (cancelled) {
        return;
      }
      setPeer(detail.peer);

      if (!partyCreatedRef.current && session) {
        partyCreatedRef.current = true;
        await mlsBridge.createParty(chatId, session.userId);
      }

      if (detail.group_exists) {
        setCurrentEpoch(detail.current_epoch ?? 1);
        const { data: welcome, error: welcomeError } =
          await api.mls.groups[chatId].welcome.get();
        if (welcomeError && welcomeError.status !== 404) {
          throw welcomeError;
        }
        if (cancelled) {
          return;
        }
        if (welcome && !welcomeError) {
          await mlsBridge.joinFromWelcome(
            chatId,
            base64UrlToBytes(welcome.welcome_bytes),
          );
          setGroupEstablished(true);
        } else {
          // Pending welcome already consumed in an earlier app session — this
          // device's MLS state for this chat can't be recovered (ADR-0010:
          // in-memory-only group state, lost on app restart).
          setMlsError(
            'Verschlüsselung für diesen Chat ist auf diesem Gerät nicht mehr verfügbar.',
          );
        }
      }

      const { data: page, error: pageError } = await api.chats[
        chatId
      ].messages.get({ $query: { limit: 100 } });
      if (pageError) {
        throw pageError;
      }
      if (cancelled) {
        return;
      }
      setHistory(page.messages.map(toRawMessage));
      setLoading(false);
    })().catch((error) => {
      console.error('failed to load chat thread:', error);
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [chatId, mlsBridge, session]);

  const allMessages = mergeById(history, messagesByChat[chatId] ?? []);

  // Decrypt anything new, once we've joined (or created) the group.
  useEffect(() => {
    if (!groupEstablished || !session) {
      return;
    }
    let cancelled = false;

    (async () => {
      for (const message of allMessages) {
        if (plaintextById[message.id] !== undefined) {
          continue;
        }
        if (message.senderUserId === session.userId) {
          continue;
        }
        try {
          const plaintext = await mlsBridge.decrypt(
            chatId,
            base64UrlToBytes(message.ciphertext),
          );
          if (cancelled) {
            return;
          }
          const text = new TextDecoder().decode(plaintext);
          setPlaintextById((prev) => ({ ...prev, [message.id]: text }));
        } catch (error) {
          console.error('failed to decrypt message', message.id, error);
          if (cancelled) {
            return;
          }
          setPlaintextById((prev) => ({
            ...prev,
            [message.id]: '🔒 (nicht entschlüsselbar)',
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupEstablished, allMessages.length, chatId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!session || !peer || !deviceId) {
        throw new Error('Chat ist noch nicht bereit zum Senden.');
      }

      let epoch = currentEpoch;

      if (!groupEstablished) {
        const { data: detail, error: detailError } =
          await api.chats[chatId].get();
        if (detailError) {
          throw detailError;
        }
        if (detail.group_exists) {
          const { data: welcome, error: welcomeError } =
            await api.mls.groups[chatId].welcome.get();
          if (welcomeError && welcomeError.status !== 404) {
            throw welcomeError;
          }
          if (!welcome || welcomeError) {
            throw new Error(
              'Verschlüsselung für diesen Chat ist auf diesem Gerät nicht verfügbar.',
            );
          }
          await mlsBridge.joinFromWelcome(
            chatId,
            base64UrlToBytes(welcome.welcome_bytes),
          );
          epoch = detail.current_epoch ?? 1;
        } else {
          const { data: peerKeyPackage, error: peerError } = await api.mls[
            'key-packages'
          ].consume.post({ user_id: peer.user_id });
          if (peerError && peerError.status !== 404) {
            throw peerError;
          }
          if (!peerKeyPackage || peerError) {
            throw new Error(
              `${peer.display_name} hat die Verschlüsselung noch nicht eingerichtet.`,
            );
          }
          await mlsBridge.createGroup(chatId);
          const welcomeBytes = await mlsBridge.addMember(
            chatId,
            base64UrlToBytes(peerKeyPackage.key_package_bytes),
          );
          const { error: groupError } = await api.mls.groups.post({
            chat_id: chatId,
            mls_group_id: bytesToBase64Url(
              ExpoCrypto.getRandomValues(new Uint8Array(16)),
            ),
            cipher_suite: CIPHER_SUITE,
            device_id: deviceId,
          });
          if (groupError) {
            throw groupError;
          }
          const { error: memberError } = await api.mls.groups[
            chatId
          ].members.post({
            new_member_user_id: peer.user_id,
            new_member_device_id: peerKeyPackage.device_id,
            leaf_index: 1,
            new_epoch: 1,
            welcome_bytes: bytesToBase64Url(welcomeBytes),
          });
          if (memberError) {
            throw memberError;
          }
          epoch = 1;
        }
        setCurrentEpoch(epoch);
        setGroupEstablished(true);
      }

      const messageId = ExpoCrypto.randomUUID();
      const ciphertext = await mlsBridge.encrypt(
        chatId,
        new TextEncoder().encode(text),
      );
      const ciphertextBase64Url = bytesToBase64Url(ciphertext);

      addLocalMessage({
        id: messageId,
        chatId,
        senderUserId: session.userId,
        senderDeviceId: deviceId,
        mlsEpoch: epoch,
        ciphertext: ciphertextBase64Url,
        contentType: 'text/plain',
        createdAt: new Date().toISOString(),
      });
      setPlaintextById((prev) => ({ ...prev, [messageId]: text }));

      const { error: sendError } = await api.messages.post({
        message_id: messageId,
        chat_id: chatId,
        sender_device_id: deviceId,
        mls_epoch: epoch,
        ciphertext: ciphertextBase64Url,
        content_type: 'text/plain',
      });
      if (sendError) {
        throw sendError;
      }
    },
    [
      session,
      peer,
      deviceId,
      currentEpoch,
      groupEstablished,
      chatId,
      mlsBridge,
      addLocalMessage,
    ],
  );

  const messages: ChatMessage[] = allMessages
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((message) => ({
      id: message.id,
      senderUserId: message.senderUserId,
      text: plaintextById[message.id] ?? '🔒 …',
      createdAt: message.createdAt,
    }));

  return { peer, messages, loading, mlsError, sendMessage };
}
