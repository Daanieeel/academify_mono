import { authClient } from './apps/mobile/lib/auth-client';

async function test() {
  const { data } = await authClient.signIn.username({
    username: 'admin',
    password: 'Demo1234!',
  });
  console.log('Session:', JSON.stringify(data?.session, null, 2));
}

test();
