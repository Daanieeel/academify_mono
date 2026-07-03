import { SessionProvider } from '@/context/auth-context';
import { MlsBridgeProvider } from '@/context/mls-context';
import { SyncProvider } from '@/context/sync-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import '../global.css';
import '../nativewind-interop';
import RootNavigator from './root-navigator';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MlsBridgeProvider>
          <SessionProvider>
            <SyncProvider>
              <RootNavigator></RootNavigator>
            </SyncProvider>
          </SessionProvider>
        </MlsBridgeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
