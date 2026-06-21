import { useSyncStore } from '@/context/sync-context';
import { api, type ChatListEntry } from '@/lib/api-client';
import { useCallback, useEffect, useState } from 'react';

export function useChats() {
  const { chatsVersion } = useSyncStore();
  const [chats, setChats] = useState<ChatListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { chats: fetched } = await api.getChats();
    setChats(fetched);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, chatsVersion]);

  return { chats, loading, refresh };
}
