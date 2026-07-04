import { authClient } from '@/lib/auth-client';
import { edenTreaty } from '@elysiajs/eden';
import type { App as ApiGatewayApp } from '@app/api-gateway';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL environment variable');
}

export let currentInstitutionId: string | null = null;
export let currentAuthToken: string | null = null;

export function setInstitutionId(id: string | null) {
  currentInstitutionId = id;
}

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
}

export const api = edenTreaty<ApiGatewayApp>(API_URL, {
  fetcher: (url: string, init?: RequestInit) => {
    const mergedHeaders = new Headers(init?.headers);
    if (currentAuthToken)
      {mergedHeaders.set('Authorization', `Bearer ${currentAuthToken}`);}
    mergedHeaders.set('Cookie', authClient.getCookie() ?? '');
    if (currentInstitutionId)
      {mergedHeaders.set('x-institution-id', currentInstitutionId);}

    return fetch(url, {
      ...init,
      headers: mergedHeaders,
    });
  },
} as any);

export { API_URL };
