import { authClient } from '@/lib/auth-client';
import { edenTreaty } from '@elysiajs/eden';
import type { App as ApiGatewayApp } from '@app/api-gateway';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL environment variable');
}

export const api = edenTreaty<ApiGatewayApp>(API_URL, {
  $fetch: {
    headers: () => ({
      Cookie: authClient.getCookie() ?? '',
    }),
  },
} as any);

export { API_URL };
