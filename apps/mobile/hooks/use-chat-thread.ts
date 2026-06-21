import { useSession } from '@/context/auth-context';
import { useMlsBridge } from '@/context/mls-context';
import { useSyncStore, type RawMessage } from '@/context/sync-context';
import { api, type MessageDto } from '@/lib/api-client';
import { base64UrlToBytes, bytesToBase64Url } from '@/lib/base64';
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

function toRawMessage(message: MessageDto): RawMessage {
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
      const detail = await api.getChatDetail(chatId);
      if (cancelled) {return;}
      setPeer(detail.peer);

      if (!partyCreatedRef.current && session) {
        partyCreatedRef.current = true;
        await mlsBridge.createParty(chatId, session.userId);
      }

      if (detail.group_exists) {
        setCurrentEpoch(detail.current_epoch ?? 1);
        const welcome = await api.getMlsWelcome(chatId);
        if (cancelled) {return;}
        if (welcome) {
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

      const page = await api.getChatMessages(chatId, { limit: 100 });
      if (cancelled) {return;}
      setHistory(page.messages.map(toRawMessage));
      setLoading(false);
    })().catch((error) => {
      console.error('failed to load chat thread:', error);
      if (!cancelled) {setLoading(false);}
    });

    return () => {
      cancelled = true;
    };
  }, [chatId, mlsBridge, session]);

  const allMessages = mergeById(history, messagesByChat[chatId] ?? []);

  // Decrypt anything new, once we've joined (or created) the group.
  useEffect(() => {
    if (!groupEstablished || !session) {return;}
    let cancelled = false;

    (async () => {
      for (const message of allMessages) {
        if (plaintextById[message.id] !== undefined) {continue;}
        if (message.senderUserId === session.userId) {continue;}
        try {
          const plaintext = await mlsBridge.decrypt(
            chatId,
            base64UrlToBytes(message.ciphertext),
          );
          if (cancelled) {return;}
          const text = new TextDecoder().decode(plaintext);
          setPlaintextById((prev) => ({ ...prev, [message.id]: text }));
        } catch (error) {
          console.error('failed to decrypt message', message.id, error);
          if (cancelled) {return;}
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
        const detail = await api.getChatDetail(chatId);
        if (detail.group_exists) {
          const welcome = await api.getMlsWelcome(chatId);
          if (!welcome) {
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
          const peerKeyPackage = await api.consumeKeyPackage(peer.user_id);
          if (!peerKeyPackage) {
            throw new Error(
              `${peer.display_name} hat die Verschlüsselung noch nicht eingerichtet.`,
            );
          }
          await mlsBridge.createGroup(chatId);
          const welcomeBytes = await mlsBridge.addMember(
            chatId,
            base64UrlToBytes(peerKeyPackage.key_package_bytes),
          );
          await api.createMlsGroup({
            chat_id: chatId,
            mls_group_id: bytesToBase64Url(
              crypto.getRandomValues(new Uint8Array(16)),
            ),
            cipher_suite: CIPHER_SUITE,
            device_id: deviceId,
          });
          await api.addMlsGroupMember(chatId, {
            new_member_user_id: peer.user_id,
            new_member_device_id: peerKeyPackage.device_id,
            leaf_index: 1,
            new_epoch: 1,
            welcome_bytes: bytesToBase64Url(welcomeBytes),
          });
          epoch = 1;
        }
        setCurrentEpoch(epoch);
        setGroupEstablished(true);
      }

      const messageId = crypto.randomUUID();
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

      await api.sendMessage({
        message_id: messageId,
        chat_id: chatId,
        sender_device_id: deviceId,
        mls_epoch: epoch,
        ciphertext: ciphertextBase64Url,
        content_type: 'text/plain',
      });
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
