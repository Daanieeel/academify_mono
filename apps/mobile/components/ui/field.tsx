import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { ValidationError } from '@tanstack/react-form';

/**
 * Field — Shadcn-compatible form field wrapper for React Native.
 *
 * Usage:
 *   <Field>
 *     <FieldLabel>Email</FieldLabel>
 *     <Input ... />
 *     <FieldError errors={field.state.meta.errors} />
 *   </Field>
 */
export function Field({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return <View className={cn('gap-1.5', className)} {...props} />;
}

/** Label for a form field */
export function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      variant="label"
      className={cn('text-foreground/70', className)}
      {...props}
    />
  );
}

/** Helper description below a form field */
export function FieldDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      variant="label"
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

interface FieldErrorProps {
  errors: ValidationError[];
  className?: string;
}

/** Renders the first validation error for a field */
export function FieldError({ errors, className }: FieldErrorProps) {
  const errorColor = useThemeColor({}, 'destructive');

  const firstError = errors[0];
  if (!firstError) {return null;}

  // TanStack Form with Zod v4 (Standard Schema) returns issue objects { message: string }
  // rather than plain strings. We handle all three possible shapes here.
  let message: string;
  if (typeof firstError === 'string') {
    message = firstError;
  } else if (firstError instanceof Error) {
    message = firstError.message;
  } else if (
    typeof firstError === 'object' &&
    firstError !== null &&
    'message' in firstError &&
    typeof (firstError as Record<string, unknown>).message === 'string'
  ) {
    message = (firstError as Record<string, unknown>).message as string;
  } else {
    message = String(firstError);
  }

  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name="warning-circle" size={13} color={errorColor} />
      <Text
        variant="label"
        className={cn('flex-1', className)}
        style={{ color: errorColor }}
      >
        {message}
      </Text>
    </View>
  );
}
