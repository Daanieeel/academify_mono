import { Platform } from 'react-native';
import { authClient } from './auth-client';
import { currentAuthToken } from './api-client';
import { edenTreaty } from '@elysiajs/eden';
import type { App as RegistryApp } from '@app/registry';

// In Expo/React Native, localhost on Android emulator points to the device itself.
// We default to 10.0.2.2 for Android simulator, or localhost for iOS simulator.
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_REGISTRY_URL) {
    return process.env.EXPO_PUBLIC_REGISTRY_URL;
  }
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3002'
    : 'http://localhost:3002';
};

const customRegistryFetch = (
  url: Parameters<typeof fetch>[0],
  init?: Parameters<typeof fetch>[1],
) => {
  const mergedHeaders = new Headers(init?.headers);
  if (currentAuthToken) {
    mergedHeaders.set('Authorization', `Bearer ${currentAuthToken}`);
  }
  mergedHeaders.set('Cookie', authClient.getCookie() ?? '');

  return fetch(url, {
    ...init,
    headers: mergedHeaders,
  });
};

export const registryClient = edenTreaty<RegistryApp>(getBaseUrl(), {
  fetcher: Object.assign(customRegistryFetch, fetch),
});
