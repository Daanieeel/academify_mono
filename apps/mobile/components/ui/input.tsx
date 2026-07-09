import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { TextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';

const inputContainerVariants = cva(
  'rounded-xl border border-foreground bg-input shadow-brutal will-change-variable',
  {
    variants: {
      variant: {
        default: '',
        display: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const inputFieldVariants = cva('text-foreground px-[20px]', {
  variants: {
    variant: {
      default: 'font-martian-regular text-[16px] leading-[20px] py-[18px]',
      display:
        'font-martian-black-narrow text-[36px] leading-[42px] tracking-[-0.5px] py-[20px]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type InputProps = React.ComponentProps<typeof TextInput> &
  VariantProps<typeof inputContainerVariants> & {
    /** Optional label shown above the input field */
    label?: string;
    /** Optional icon to display on the left side of the input */
    leftIcon?: React.ReactNode;
    containerClassName?: string;
    ref?: React.Ref<TextInput> | undefined;
  };

/**
 * Shadcn-compatible Input component.
 *
 * Brutalist design: thick border + hard offset shadow (matches Button/Card).
 * Background matches the page surface so the input reads as a clean canvas.
 * Variants:
 * - `default`: standard 16px body text input
 * - `display`: large heading-style input (e.g., group name entry)
 */
export function Input({
  variant = 'default',
  label,
  leftIcon,
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
        inputContainerVariants({ variant }),
        !editable && 'opacity-50',
        containerClassName,
      )}
    >
      {label && (
        <Text
          variant="label"
          className="text-foreground/50 pt-[12px] px-[20px]"
        >
          {label}
        </Text>
      )}
      <View className="relative justify-center">
        {leftIcon && (
          <View className="absolute left-[16px] z-10 pointer-events-none">
            {leftIcon}
          </View>
        )}
        <TextInput
          ref={ref}
          editable={editable}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          placeholderTextColor="hsl(30, 15%, 55%)"
          className={cn(
            inputFieldVariants({ variant }),
            leftIcon && 'pl-[48px]',
            label && 'pt-[4px]',
            className,
          )}
          {...props}
        />
      </View>
    </View>
  );
}
