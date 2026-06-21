import { bytesToBase64, base64ToBytes } from '@/lib/base64';
import { MLS_WEBVIEW_HTML } from '@repo/mls/webview';
import {
  createContext,
  use,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

// Real OpenMLS crypto, run inside a hidden WebView (see docs/adr/0010) since
// Hermes has no WebAssembly support at all. Mirrors `MlsParty`'s call surface
// from packages/mls, just async since every call is a postMessage round-trip.
//
// One wasm `MlsParty` instance holds exactly one `Option<MlsGroup>` (a single
// chat's group), so every method here is keyed by `chatId`, not by user —
// the same logged-in user's identity joins a separate party per chat.
export type MlsBridge = {
  ready: boolean;
  createParty: (chatId: string, identity: string) => Promise<void>;
  generateKeyPackage: (chatId: string) => Promise<Uint8Array>;
  createGroup: (chatId: string) => Promise<void>;
  addMember: (
    chatId: string,
    keyPackageBytes: Uint8Array,
  ) => Promise<Uint8Array>;
  joinFromWelcome: (chatId: string, welcomeBytes: Uint8Array) => Promise<void>;
  encrypt: (chatId: string, plaintext: Uint8Array) => Promise<Uint8Array>;
  decrypt: (chatId: string, ciphertext: Uint8Array) => Promise<Uint8Array>;
};

type RpcReply = { id: string; result?: string | null; error?: string };

type PendingEntry = {
  resolve: (value: string | null) => void;
  reject: (reason: Error) => void;
};

const RPC_TIMEOUT_MS = 15000;

const MlsBridgeContext = createContext<MlsBridge | null>(null);

export function useMlsBridge(): MlsBridge {
  const value = use(MlsBridgeContext);
  if (!value) {
    throw new Error('useMlsBridge must be used within a <MlsBridgeProvider />');
  }
  return value;
}

export function MlsBridgeProvider({ children }: PropsWithChildren) {
  const webViewRef = useRef<WebView>(null);
  const pending = useRef(new Map<string, PendingEntry>());
  const nextId = useRef(0);
  const [ready, setReady] = useState(false);

  const call = (method: string, chatId: string, args: string[] = []) => {
    const id = String(nextId.current++);
    return new Promise<string | null>((resolve, reject) => {
      pending.current.set(id, { resolve, reject });
      webViewRef.current?.postMessage(
        JSON.stringify({ id, method, partyId: chatId, args }),
      );
      setTimeout(() => {
        if (pending.current.delete(id)) {
          reject(new Error(`MLS bridge call "${method}" timed out`));
        }
      }, RPC_TIMEOUT_MS);
    });
  };

  const onMessage = (event: WebViewMessageEvent) => {
    let reply: RpcReply;
    try {
      reply = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (reply.id === '__ready__') {
      if (reply.error) {
        console.error('MLS bridge failed to initialize:', reply.error);
        return;
      }
      setReady(true);
      return;
    }

    const entry = pending.current.get(reply.id);
    if (!entry) {
      return;
    }
    pending.current.delete(reply.id);
    if (reply.error) {
      entry.reject(new Error(reply.error));
    } else {
      entry.resolve(reply.result ?? null);
    }
  };

  const bridge = useMemo<MlsBridge>(
    () => ({
      ready,
      createParty: async (chatId, identity) => {
        await call('createParty', chatId, [identity]);
      },
      generateKeyPackage: async (chatId) => {
        const result = await call('generateKeyPackage', chatId);
        return base64ToBytes(result!);
      },
      createGroup: async (chatId) => {
        await call('createGroup', chatId);
      },
      addMember: async (chatId, keyPackageBytes) => {
        const result = await call('addMember', chatId, [
          bytesToBase64(keyPackageBytes),
        ]);
        return base64ToBytes(result!);
      },
      joinFromWelcome: async (chatId, welcomeBytes) => {
        await call('joinFromWelcome', chatId, [bytesToBase64(welcomeBytes)]);
      },
      encrypt: async (chatId, plaintext) => {
        const result = await call('encrypt', chatId, [
          bytesToBase64(plaintext),
        ]);
        return base64ToBytes(result!);
      },
      decrypt: async (chatId, ciphertext) => {
        const result = await call('decrypt', chatId, [
          bytesToBase64(ciphertext),
        ]);
        return base64ToBytes(result!);
      },
    }),
    [ready],
  );

  return (
    <MlsBridgeContext.Provider value={bridge}>
      {/* `width: 0, height: 0` alone isn't enough — WebView still claims real
          layout space in normal flow (seen as a flex:1 box eating the screen).
          Absolute-position it out of flow entirely so it can never displace
          real content regardless of WebView's internal default sizing. */}
      <View style={styles.hiddenView} pointerEvents="none">
        {/* WebView's own `style` stays inline rather than className — this is
            the exact prop that silently failed to size correctly before (see
            comment above), so it keeps the one styling path verified to work
            rather than trusting NativeWind's third-party-component interop. */}
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: MLS_WEBVIEW_HTML }}
          onMessage={onMessage}
          style={{ width: 1, height: 1 }}
        />
      </View>
      {children}
    </MlsBridgeContext.Provider>
  );
}

const styles = StyleSheet.create({
  hiddenView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});
