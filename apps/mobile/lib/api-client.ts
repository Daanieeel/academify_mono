import { authClient } from '@/lib/auth-client';
import { edenTreaty } from '@elysiajs/eden';
import type { App as ApiGatewayApp } from '@app/api-gateway';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!ENV_API_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL environment variable');
}
const API_URL: string = ENV_API_URL;

export let currentInstitutionId: string | null = null;
export let currentAuthToken: string | null = null;

export function setInstitutionId(id: string | null) {
  currentInstitutionId = id;
}

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
}

const customApiFetch = (
  url: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
) => {
  const mergedHeaders = new Headers(init?.headers);
  if (currentAuthToken) {
    mergedHeaders.set('Authorization', `Bearer ${currentAuthToken}`);
  }
  mergedHeaders.set('Cookie', authClient.getCookie() ?? '');
  if (currentInstitutionId) {
    mergedHeaders.set('x-institution-id', currentInstitutionId);
  }

  return fetch(url, {
    ...init,
    headers: mergedHeaders,
  });
};

export const api: ReturnType<typeof edenTreaty<ApiGatewayApp>> =
  edenTreaty<ApiGatewayApp>(API_URL, {
    fetcher: Object.assign(customApiFetch, fetch),
  });

export { API_URL };
