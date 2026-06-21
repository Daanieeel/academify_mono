import { authClient } from '@/lib/auth-client';
import { createContext, use, type PropsWithChildren } from 'react';

const AuthContext = createContext<{
  signIn: (
    username: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  session: { userId: string; username: string } | null;
  isLoading: boolean;
}>({
  signIn: async () => ({ error: 'not wrapped in a SessionProvider' }),
  signOut: async () => {},
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrappe in a <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const { data, isPending } = authClient.useSession();

  const signIn = async (username: string, password: string) => {
    const { error } = await authClient.signIn.username({ username, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  const session = data
    ? { userId: data.user.id, username: data.user.username ?? data.user.name }
    : null;

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        isLoading: isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
