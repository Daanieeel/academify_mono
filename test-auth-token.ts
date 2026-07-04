import { authClient } from './apps/mobile/lib/auth-client';
type A = Awaited<ReturnType<typeof authClient.signIn.username>>;
// Just output the types
