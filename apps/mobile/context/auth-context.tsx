import { authClient } from '@/lib/auth-client';
import {
  createContext,
  use,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import { setAuthToken } from '@/lib/api-client';

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

  useEffect(() => {
    if (data?.session?.token) {
      setAuthToken(data.session.token);
    } else if (!isPending) {
      setAuthToken(null);
    }
  }, [data, isPending]);

  const signIn = async (username: string, password: string) => {
    const { error, data: signInData } = await authClient.signIn.username({
      username,
      password,
    });
    if (signInData?.session?.token) {
      setAuthToken(signInData.session.token);
    }
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await authClient.signOut();
    setAuthToken(null);
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
