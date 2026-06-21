import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import { usernameClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    usernameClient(),
    expoClient({
      scheme: 'academifyv3',
      storagePrefix: 'academify',
      storage: SecureStore,
    }),
  ],
});
