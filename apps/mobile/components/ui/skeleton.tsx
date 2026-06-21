import { cn } from '@/lib/utils';
import type * as React from 'react';
import { View } from 'react-native';

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn('bg-neutral-200 animate-pulse rounded-[8px]', className)}
      {...props}
    />
  );
}
