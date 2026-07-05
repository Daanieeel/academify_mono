import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Platform } from 'react-native';

export function getAssetUrl(url?: string | null): string | undefined {
  if (!url) {
    return undefined;
  }
  if (url.includes('localhost')) {
    if (process.env.EXPO_PUBLIC_API_URL) {
      try {
        const apiHost = new URL(process.env.EXPO_PUBLIC_API_URL).hostname;
        return url.replace('localhost', apiHost);
      } catch {
        // Ignore parsing errors
      }
    } else if (Platform.OS === 'android') {
      return url.replace('localhost', '10.0.2.2');
    }
  }
  return url;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
