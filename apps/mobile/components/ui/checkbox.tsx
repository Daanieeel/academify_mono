import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import type * as React from 'react';

export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'h-[22px] w-[22px] items-center justify-center rounded-[6px] border-[1.5px] border-neutral-400',
        props.checked && 'bg-primary-900 border-primary-900',
        props.disabled && 'opacity-50',
        className,
      )}
      hitSlop={12}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="items-center justify-center">
        <Icon name="check" size={14} className="text-neutral-50" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
