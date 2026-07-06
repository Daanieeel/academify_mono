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
  ) => Promise<{
    error: string | null;
    session?: NonNullable<
      Awaited<ReturnType<typeof authClient.signIn.username>>
    >['data']['session'];
  }>;
  signOut: () => Promise<void>;
  session: {
    userId: string;
    username: string;
    mainInstitutionId?: string | null;
  } | null;
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
  const [optimisticUser, setOptimisticUser] = useState<
    NonNullable<typeof data>['user'] | null
  >(null);

  useEffect(() => {
    if (data?.session?.token) {
      setAuthToken(data.session.token);
    } else if (!isPending) {
      setAuthToken(null);
    }
  }, [data, isPending]);

  const signIn = async (username: string, password: string) => {
    try {
      const { error, data: signInData } = await authClient.signIn.username({
        username,
        password,
      });
      if (signInData?.token) {
        setAuthToken(signInData.token);
      }
      if (signInData?.user) {
        setOptimisticUser(signInData.user);
      }
      return { error: error?.message ?? null, session: signInData?.user };
    } catch (e) {
      console.error('Failed to sign in:', e);
      return {
        error:
          'Verbindung zum Server fehlgeschlagen. Bitte überprüfe deine Internetverbindung.',
        session: null,
      };
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    setAuthToken(null);
    setOptimisticUser(null);
  };

  const userToUse:
    | (NonNullable<typeof data>['user'] & {
        mainInstitutionId?: string | null;
        username?: string | null;
      })
    | null
    | undefined = data?.user || optimisticUser;
  const session = userToUse
    ? {
        userId: userToUse.id,
        username: userToUse.username ?? userToUse.name,
        mainInstitutionId: userToUse.mainInstitutionId,
      }
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
