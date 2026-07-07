import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/**
 * Typography scale — MartianGrotesk font family.
 * Default color: foreground (semantic).
 */
const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      /** 10px extrabold — labels, badges, captions */
      caption:
        'font-martian-extrabold text-[10px] leading-[13.6px] tracking-[0.2px]',
      /** 12px medium — small UI labels */
      label: 'font-martian-medium text-[12px] leading-[16px]',
      /** 14px regular — body copy */
      body: 'font-martian-regular text-[14px] leading-[20.5px]',
      /** 18px medium — card subtitles */
      lead: 'font-martian-medium text-[18px] leading-[24px]',
      /** 22.65px medium — section subheadings */
      subheading:
        'font-martian-medium text-[22.65px] leading-[31.1px] tracking-[0.1px]',
      /** 36.65px narrow-black — hero numbers, display */
      h2: 'font-martian-black-narrow text-[36.65px] leading-[40.1px] tracking-[-0.2px]',
      /** 59.3px extrabold — page headings */
      h1: 'font-martian-extrabold text-[59.3px] leading-[67.6px]',
      /** 95.95px black — display / splash */
      display: 'font-martian-black text-[95.95px] leading-[105.4px]',
      /** 95.95px wide-black — extra-wide display */
      'display-wide':
        'font-martian-black-wide text-[95.95px] leading-[105.4px]',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

export type TextVariantProps = VariantProps<typeof textVariants>;

/**
 * Context used by Button and Icon to propagate their text color
 * into child Text / Icon components without prop drilling.
 */
export const TextClassContext = React.createContext<string | undefined>(
  undefined,
);

export type TextProps = RNTextProps &
  TextVariantProps & {
    /** Render as the slot child (inherits parent element) */
    asChild?: boolean;
    /** Inline color override — prefer Tailwind classes instead */
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
