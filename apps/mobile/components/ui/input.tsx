import { cn } from '@/lib/utils';
import * as React from 'react';
import { TextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';

export type InputProps = React.ComponentProps<typeof TextInput> & {
  /** Optional label shown above the input field */
  label?: string;
  /** Visual size variant */
  variant?: 'default' | 'display';
  containerClassName?: string;
  ref?: React.Ref<TextInput> | undefined;
};

/**
 * Shadcn-compatible Input component.
 *
 * Brutalist design: thick border, clear focus ring, warm background.
 * Variants:
 * - `default`: standard 14px body text input
 * - `display`: large heading-style input (e.g., group name entry)
 */
export function Input({
  variant = 'default',
  label,
  containerClassName,
  className,
  ref,
  editable = true,
  secureTextEntry,
  ...props
}: InputProps) {
  return (
    <View
      className={cn(
        'rounded-xl border-2 border-border bg-input px-4 gap-1',
        variant === 'default' ? 'py-3' : 'py-4',
        !editable && 'opacity-60',
        containerClassName,
      )}
    >
      {label && (
        <Text variant="label" className="text-muted-foreground">
          {label}
        </Text>
      )}
      <TextInput
        ref={ref}
        editable={editable}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        placeholderTextColor="hsl(var(--muted-foreground))"
        className={cn(
          'text-foreground p-0',
          variant === 'default'
            ? 'font-martian-regular text-[14px] leading-[20px]'
            : 'font-martian-black-narrow text-[36px] leading-[42px] tracking-[-0.5px]',
          className,
        )}
        {...props}
      />
    </View>
  );
}
