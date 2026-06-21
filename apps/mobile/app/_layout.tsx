import { SessionProvider } from '@/context/auth-context';
import { MlsBridgeProvider } from '@/context/mls-context';
import { SyncProvider } from '@/context/sync-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import RootNavigator from './root-navigator';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MlsBridgeProvider>
        <SessionProvider>
          <SyncProvider>
            <RootNavigator></RootNavigator>
          </SyncProvider>
        </SessionProvider>
      </MlsBridgeProvider>
    </SafeAreaProvider>
  );
}
