import { TextClassContext } from '@/components/ui/text';
import ThemedPressable, {
  type ThemedPressableProps,
} from '@/components/themed-pressable';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva('flex-row items-center justify-center gap-[8px]', {
  variants: {
    variant: {
      primary: 'bg-neutral-900 border-[1.5px] border-neutral-700',
      secondary: 'bg-transparent border-[1.5px] border-neutral-200',
      normal: 'bg-neutral-200 border-0',
      inverted: 'bg-neutral-900 border-0',
      dotted: 'bg-transparent border-[2px] border-neutral-400',
      destructive: 'bg-red-600 border-0',
    },
    size: {
      lg: 'rounded-[18px] px-[25px] h-[60px]',
      default: 'rounded-[18px] px-[20px] py-[10px]',
    },
  },
  defaultVariants: {
    variant: 'normal',
    size: 'default',
  },
});

const buttonTextVariants = cva('', {
  variants: {
    variant: {
      primary: 'text-neutral-50',
      secondary: 'text-neutral-900',
      normal: 'text-neutral-900',
      inverted: 'text-neutral-100',
      dotted: 'text-neutral-900',
      destructive: 'text-neutral-50',
    },
  },
  defaultVariants: {
    variant: 'normal',
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
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <ThemedPressable
        onPress={onPress ?? (() => {})}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    </TextClassContext.Provider>
  );
}
