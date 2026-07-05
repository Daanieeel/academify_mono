import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { username, bearer } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, user, session, account, verification } from '@repo/database';

const authOptions: BetterAuthOptions = {
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  user: {
    additionalFields: {
      photoRef: { type: 'string' },
      avatarBackgroundColor: { type: 'string' },
      avatarEmoji: { type: 'string' },
      mainInstitutionId: { type: 'string' },
      canManageAccounts: { type: 'boolean' },
    },
  },
  emailAndPassword: { enabled: false },
  // `academifyv3://` is the mobile app's scheme (apps/mobile/app.json) — the
  // Expo plugin sets it as the Origin header on native requests, which
  // better-auth otherwise rejects as untrusted.
  trustedOrigins: ['academifyv3://'],
  plugins: [username(), bearer(), expo()],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
};

export const auth = betterAuth(authOptions);

export type Auth = typeof auth;
export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;
