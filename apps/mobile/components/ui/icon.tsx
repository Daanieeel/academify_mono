import IcomoonIcon from '@/components/IcomoonIcon';
import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';

export type IconProps = React.ComponentProps<typeof IcomoonIcon> & {
  name: string;
};

export function Icon({ className, size = 16, ...props }: IconProps) {
  const textClass = React.useContext(TextClassContext);
  return (
    <IcomoonIcon
      className={cn('text-neutral-900', textClass, className)}
      size={size}
      {...props}
    />
  );
}
