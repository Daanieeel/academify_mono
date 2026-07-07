import IcomoonIcon from '@/components/IcomoonIcon';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';

export type IconProps = React.ComponentProps<typeof IcomoonIcon> & {
  name: string;
};

/**
 * Icon — thin wrapper over IcomoonIcon.
 * Reads TextClassContext to inherit color from parent (e.g., inside Button).
 * Defaults to foreground color for semantic correctness.
 */
export function Icon({ className, size = 16, color, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <IcomoonIcon
      className={cn(!color && 'text-foreground', textClass, className)}
      size={size}
      color={color}
      {...props}
    />
  );
}
