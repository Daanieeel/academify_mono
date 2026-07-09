import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

/**
 * Card — Shadcn-compatible compound component.
 *
 * Brutalist design: thick border + hard shadow for depth,
 * warm card background (off-white parchment in light, dark espresso in dark).
 */
export function Card({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        'rounded-xl border border-foreground bg-card shadow-brutal',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return <View className={cn('flex-col gap-1.5 p-5', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      variant="subheading"
      className={cn('text-card-foreground', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      variant="body"
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return <View className={cn('p-5 pt-0', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn('flex-row items-center p-5 pt-0', className)}
      {...props}
    />
  );
}
