import { auth } from '@repo/auth';
async function test() {
  try {
    const result = await auth.api.getSession({ headers: new Headers() });
    console.log('Result:', result);
  } catch (e: any) {
    console.log('Error:', e);
    console.log('Message:', e.message);
  }
}
test();
