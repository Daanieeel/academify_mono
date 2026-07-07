import { cn } from '@/lib/utils';
import * as React from 'react';
import { Text } from 'react-native';

/**
 * Badge — Shadcn-compatible status / category chip.
 *
 * Brutalist variants follow the same token naming as Button.
 */

import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex flex-row items-center rounded-full border-2 px-2.5 py-0.5 self-start',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary',
        secondary: 'border-transparent bg-secondary',
        destructive: 'border-transparent bg-destructive',
        outline: 'border-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const badgeTextVariants = cva(
  'font-martian-extrabold text-[10px] tracking-[0.4px] uppercase',
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        secondary: 'text-secondary-foreground',
        destructive: 'text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type BadgeProps = React.ComponentProps<typeof Text> &
  VariantProps<typeof badgeVariants> & {
    containerClassName?: string;
  };

export function Badge({
  children,
  variant,
  className,
  containerClassName,
  ...props
}: BadgeProps) {
  return (
    <Text
      className={cn(
        badgeVariants({ variant }),
        badgeTextVariants({ variant }),
        containerClassName,
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
}
