import { TextClassContext } from '@/components/ui/text';
import ThemedPressable, {
  type ThemedPressableProps,
} from '@/components/themed-pressable';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

/**
 * Button variants following the Shadcn/ui naming scheme.
 *
 * Brutalist design notes:
 * - `default`: solid primary brown with a hard offset shadow for depth.
 * - `outline`: transparent with a thick 2px border; shadow on active.
 * - `secondary`: muted fill, no shadow.
 * - `ghost`: no border/fill, hover-only effect.
 * - `destructive`: deep red.
 * - `link`: text-only, underline.
 */
const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 active:opacity-90 will-change-variable',
  {
    variants: {
      variant: {
        default: 'bg-primary border border-foreground rounded-xl shadow-brutal',
        destructive:
          'bg-destructive border border-foreground rounded-xl shadow-brutal',
        outline: 'bg-transparent border border-foreground rounded-xl',
        secondary:
          'bg-secondary border border-foreground rounded-xl shadow-brutal',
        untis:
          'bg-untis-orange border border-foreground rounded-xl shadow-brutal',
        ghost: 'bg-transparent',
        link: 'bg-transparent',
      },
      size: {
        default: 'h-[52px] px-5',
        sm: 'h-[40px] px-4 rounded-lg',
        lg: 'h-[60px] px-7',
        icon: 'h-[44px] w-[44px] rounded-full',
        round: 'h-[60px] w-[60px] rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('font-martian-extrabold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      untis: 'text-white',
      ghost: 'text-foreground',
      link: 'text-primary underline',
    },
    size: {
      default: 'text-[14px]',
      sm: 'text-[13px]',
      lg: 'text-[16px]',
      icon: 'text-[14px]',
      round: 'text-[14px]',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export type ButtonProps = Omit<ThemedPressableProps, 'onPress'> &
  VariantProps<typeof buttonVariants> & {
    onPress?: () => void;
  };

export function Button({
  className,
  variant,
  size,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <ThemedPressable
        onPress={onPress ?? (() => {})}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
