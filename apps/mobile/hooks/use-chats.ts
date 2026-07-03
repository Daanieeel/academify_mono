import { useQuery } from '@tanstack/react-query';
import { useSyncStore } from '@/context/sync-context';
import { api } from '@/lib/api-client';

export function useChats() {
  const { chatsVersion } = useSyncStore();

  const {
    data: chats = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['chats', chatsVersion],
    queryFn: async () => {
      const { data, error } = await api.chats.get();
      if (error) {throw error;}
      return data?.chats ?? [];
    },
  });

  return { chats, loading: isLoading, refresh: refetch };
}
