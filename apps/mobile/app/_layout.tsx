import { SessionProvider } from '@/context/auth-context';
import '../global.css';
import RootNavigator from './root-navigator';

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootNavigator></RootNavigator>
    </SessionProvider>
  );
}
