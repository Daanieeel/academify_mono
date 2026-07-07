import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import type * as React from 'react';

/**
 * Checkbox — Shadcn-compatible.
 *
 * Brutalist: thick 2px border, square (not pill).
 * Checked state: primary bg with a checkmark icon.
 */
export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'h-[22px] w-[22px] items-center justify-center rounded-md border-2 border-border',
        props.checked && 'bg-primary border-primary',
        props.disabled && 'opacity-50',
        className,
      )}
      hitSlop={12}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="items-center justify-center">
        <Icon name="check" size={13} className="text-primary-foreground" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
