import { authClient } from './apps/web/lib/auth-client';
import { api } from './apps/mobile/lib/api-client';

async function test() {
  const { data, error } = await authClient.signIn.username({
    username: 'admin',
    password: 'Demo1234!',
  });
  console.log('Session token:', data?.session?.token);
}
test();
