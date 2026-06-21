import { cn } from '@/lib/utils';
import * as SeparatorPrimitive from '@rn-primitives/separator';
import type * as React from 'react';

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-neutral-100',
        orientation === 'horizontal' ? 'h-[1.5px] w-full' : 'h-full w-[1.5px]',
        className,
      )}
      {...props}
    />
  );
}
