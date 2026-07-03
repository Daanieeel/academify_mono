import { Platform } from 'react-native';
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

export const registryClient = edenTreaty<RegistryApp>(getBaseUrl());
