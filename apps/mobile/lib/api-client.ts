import { authClient } from '@/lib/auth-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

// `authClient`'s own `$fetch` returns better-fetch's `{ data, error }` shape,
// not a standard `Response` — and RN has no shared cookie jar across separate
// `fetch` calls the way a browser does, so every request here attaches the
// session cookie by hand via the expo plugin's `getCookie()` (its documented
// escape hatch for exactly this case).
async function request(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Cookie: authClient.getCookie(),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(
      `${path} failed: ${response.status} ${await response.text()}`,
    );
  }
  return response;
}

export type MeResponse = {
  user_id: string;
  username: string;
  display_name: string;
  role:
    | 'student'
    | 'teacher'
    | 'admin'
    | 'compliance_officer'
    | 'headmaster'
    | null;
  class_name: string | null;
  avatar_background_color: string | null;
  avatar_emoji: string | null;
};
export type Contact = {
  user_id: string;
  display_name: string;
  role:
    | 'student'
    | 'teacher'
    | 'admin'
    | 'compliance_officer'
    | 'headmaster'
    | null;
  class_name: string | null;
  avatar_background_color: string | null;
  avatar_emoji: string | null;
};
export type SchoolClass = {
  class_id: string;
  class_name: string;
  member_count: number;
};
export type ChatListEntry = {
  chat_id: string;
  type: string;
  peer: { user_id: string; display_name: string } | null;
  last_message_at: string | null;
  read: boolean;
};
export type ChatDetail = {
  chat_id: string;
  peer: { user_id: string; display_name: string } | null;
  group_exists: boolean;
  current_epoch: number | null;
};
export type MessageDto = {
  message_id: string;
  chat_id: string;
  sender_user_id: string;
  sender_device_id: string;
  mls_epoch: number;
  ciphertext: string;
  content_type: string;
  created_at: string;
  deleted: boolean;
};

export const api = {
  getMe: async (): Promise<MeResponse> => (await request('/me')).json(),

  getContacts: async (): Promise<Contact[]> =>
    (await request('/contacts')).json(),

  getClasses: async (): Promise<SchoolClass[]> =>
    (await request('/classes')).json(),

  updateMyAvatar: async (avatar: {
    backgroundColor: string;
    emoji: string;
  }): Promise<{
    avatar_background_color: string | null;
    avatar_emoji: string | null;
  }> =>
    (
      await request('/me/avatar', {
        method: 'PATCH',
        body: JSON.stringify({
          background_color: avatar.backgroundColor,
          emoji: avatar.emoji,
        }),
      })
    ).json(),

  getChats: async (): Promise<{ chats: ChatListEntry[] }> =>
    (await request('/chats')).json(),

  createChat: async (peerUserId: string): Promise<{ chat_id: string }> =>
    (
      await request('/chats', {
        method: 'POST',
        body: JSON.stringify({ peer_user_id: peerUserId }),
      })
    ).json(),

  getChatDetail: async (chatId: string): Promise<ChatDetail> =>
    (await request(`/chats/${chatId}`)).json(),

  getChatMessages: async (
    chatId: string,
    options?: { beforeCursor?: string; limit?: number },
  ): Promise<{ messages: MessageDto[]; has_more: boolean }> => {
    const params = new URLSearchParams();
    if (options?.beforeCursor) {
      params.set('before_cursor', options.beforeCursor);
    }
    if (options?.limit) {
      params.set('limit', String(options.limit));
    }
    const query = params.toString();
    return (
      await request(`/chats/${chatId}/messages${query ? `?${query}` : ''}`)
    ).json();
  },

  getMessage: async (messageId: string): Promise<MessageDto> =>
    (await request(`/messages/${messageId}`)).json(),

  sendMessage: async (payload: {
    message_id: string;
    chat_id: string;
    sender_device_id: string;
    mls_epoch: number;
    ciphertext: string;
    content_type: string;
  }): Promise<{ accepted: boolean; message_id: string }> =>
    (
      await request('/messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).json(),

  registerDevice: async (
    identityPubkey: string,
  ): Promise<{ device_id: string }> =>
    (
      await request('/mls/devices', {
        method: 'POST',
        body: JSON.stringify({ identity_pubkey: identityPubkey }),
      })
    ).json(),

  uploadKeyPackage: async (
    deviceId: string,
    keyPackageBytes: string,
  ): Promise<{ key_package_id: string }> =>
    (
      await request('/mls/key-packages', {
        method: 'POST',
        body: JSON.stringify({
          device_id: deviceId,
          key_package_bytes: keyPackageBytes,
        }),
      })
    ).json(),

  consumeKeyPackage: async (
    peerUserId: string,
  ): Promise<{ device_id: string; key_package_bytes: string } | null> => {
    const response = await fetch(`${API_URL}/mls/key-packages/consume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: authClient.getCookie(),
      },
      body: JSON.stringify({ user_id: peerUserId }),
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(
        `consumeKeyPackage failed: ${response.status} ${await response.text()}`,
      );
    }
    return response.json();
  },

  createMlsGroup: async (payload: {
    chat_id: string;
    mls_group_id: string;
    cipher_suite: string;
    device_id: string;
  }): Promise<{ group_id: string; current_epoch: number }> =>
    (
      await request('/mls/groups', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).json(),

  addMlsGroupMember: async (
    chatId: string,
    payload: {
      new_member_user_id: string;
      new_member_device_id: string;
      leaf_index: number;
      new_epoch: number;
      welcome_bytes: string;
    },
  ): Promise<{ accepted: boolean }> =>
    (
      await request(`/mls/groups/${chatId}/members`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    ).json(),

  getMlsWelcome: async (
    chatId: string,
  ): Promise<{ welcome_bytes: string } | null> => {
    const response = await fetch(`${API_URL}/mls/groups/${chatId}/welcome`, {
      headers: { Cookie: authClient.getCookie() },
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(
        `getMlsWelcome failed: ${response.status} ${await response.text()}`,
      );
    }
    return response.json();
  },
};

export { API_URL };
