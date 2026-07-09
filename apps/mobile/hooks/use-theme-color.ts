import { resolveColor, type ColorScheme, brand } from '@/themes/colors';
import { useColorScheme } from 'react-native';

/**
 * Legacy color map — bridges old specific color values
 * to the new semantic tokens in the Shadcn design system.
 */
const legacyMap: Record<string, keyof ColorScheme | 'untisOrange'> = {
  'neutral-50': 'background',
  'neutral-100': 'card',
  'primary-900': 'primary',
  'neutral-900': 'foreground',
  'red-500': 'destructive',
  destructive: 'destructive',
  'green-500': 'primary', // Green mapped to primary for brutalist theme
  'neutral-400': 'mutedForeground',
  'untis-orange': 'untisOrange',
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string,
) {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const semanticKey = legacyMap[colorName];

  if (semanticKey === 'untisOrange') {
    return brand.untisOrange;
  }

  if (semanticKey) {
    return resolveColor(semanticKey as keyof ColorScheme, colorScheme);
  }

  // Fallback if an unmapped color is passed
  console.warn(`Unmapped theme color used: ${colorName}`);
  return '#FF00FF'; // Bright magenta to easily spot missed mappings
}
