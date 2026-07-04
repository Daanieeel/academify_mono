import {
  createContext,
  use,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { setInstitutionId } from '@/lib/api-client';

const ACTIVE_INSTITUTION_KEY = 'activeInstitutionId';

const InstitutionContext = createContext<{
  activeInstitutionId: string | null;
  setActiveInstitutionId: (id: string | null) => Promise<void>;
  isLoading: boolean;
}>({
  activeInstitutionId: null,
  setActiveInstitutionId: async () => {},
  isLoading: true,
});

export function useInstitution() {
  const value = use(InstitutionContext);
  if (!value) {
    throw new Error(
      'useInstitution must be wrapped in an <InstitutionProvider />',
    );
  }
  return value;
}

export function InstitutionProvider({ children }: PropsWithChildren) {
  const [activeInstitutionId, setActiveInstitutionIdState] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActiveInstitution() {
      try {
        const storedId = await SecureStore.getItemAsync(ACTIVE_INSTITUTION_KEY);
        if (storedId) {
          setActiveInstitutionIdState(storedId);
          setInstitutionId(storedId);
        }
      } catch (e) {
        console.error('Failed to load active institution', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadActiveInstitution();
  }, []);

  const setActiveInstitutionId = async (id: string | null) => {
    try {
      if (id) {
        await SecureStore.setItemAsync(ACTIVE_INSTITUTION_KEY, id);
      } else {
        await SecureStore.deleteItemAsync(ACTIVE_INSTITUTION_KEY);
      }
      setActiveInstitutionIdState(id);
      setInstitutionId(id);
    } catch (e) {
      console.error('Failed to save active institution', e);
    }
  };

  return (
    <InstitutionContext.Provider
      value={{
        activeInstitutionId,
        setActiveInstitutionId,
        isLoading,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}
