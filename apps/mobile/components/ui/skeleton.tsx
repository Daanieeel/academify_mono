import { cn } from '@/lib/utils';
import type * as React from 'react';
import { View } from 'react-native';

/**
 * Skeleton — Shadcn-compatible.
 * Muted background for loading placeholder content.
 */
export function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn('bg-muted animate-pulse rounded-lg', className)}
      {...props}
    />
  );
}
