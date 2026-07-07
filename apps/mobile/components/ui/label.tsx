import { cn } from '@/lib/utils';
import * as React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

export type LabelProps = RNTextProps & {
  htmlFor?: string;
};

/**
 * Label — Shadcn-compatible form field label.
 *
 * Use above inputs, checkboxes, radios, etc.
 * Styled with the martian-extrabold font for clarity.
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <RNText
      className={cn(
        'font-martian-extrabold text-[13px] text-foreground leading-none',
        className,
      )}
      {...props}
    />
  );
}
