import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

const textVariants = cva('text-neutral-900', {
  variants: {
    variant: {
      caption: 'font-[MartianGrotesk-StdxBd] text-[10px] leading-[13.6px]',
      body: 'font-[MartianGrotesk-StdRg] text-[14px] leading-[20.5px]',
      subHeading:
        'font-[MartianGrotesk-StdMd] text-[22.65px] leading-[31.1px] tracking-[0.1px]',
      heading2:
        'font-[MartianGrotesk-NrBl] text-[36.65px] leading-[40.1px] tracking-[-0.2px]',
      heading1: 'font-[MartianGrotesk-StdxBd] text-[59.3px] leading-[67.6px]',
      title: 'font-[MartianGrotesk-StdBl] text-[95.95px] leading-[125.4px]',
      titleWide: 'font-[MartianGrotesk-sWdBl] text-[95.95px] leading-[205.4px]',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

export type TextVariantProps = VariantProps<typeof textVariants>;

export const TextClassContext = React.createContext<string | undefined>(
  undefined,
);

export type TextProps = RNTextProps &
  TextVariantProps & {
    asChild?: boolean;
    color?: string;
  };

export function Text({
  className,
  asChild = false,
  variant = 'body',
  color,
  style,
  ...props
}: TextProps) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      style={[color ? { color } : undefined, style]}
      {...props}
    />
  );
}
