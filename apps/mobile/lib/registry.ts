import { Platform } from 'react-native';

export interface Institution {
  slug: string;
  display_name: string;
  type: string | null;
  region: string | null;
  country: string | null;
}

export interface Resolution {
  slug: string;
  display_name: string;
  deployment_mode: 'hosted' | 'self_hosted';
  backend_url: string | null;
  status: string;
}

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

export async function searchInstitutions(
  query: string,
): Promise<Institution[]> {
  const registryUrl = getBaseUrl();

  const url = new URL('/institutions', registryUrl);
  if (query) {
    url.searchParams.set('search', query);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error('Failed to fetch institutions');
  }
  const data = await res.json();
  return data.institutions;
}

export async function resolveInstitution(slug: string): Promise<Resolution> {
  const registryUrl = getBaseUrl();

  const res = await fetch(`${registryUrl}/institutions/${slug}/resolve`);
  if (!res.ok) {
    throw new Error('Failed to resolve institution');
  }
  return res.json();
}
