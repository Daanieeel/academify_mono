import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@rn-primitives/tabs';
import type * as React from 'react';

/**
 * Tabs — Shadcn-compatible compound component.
 *
 * TabsList: muted background pill container.
 * TabsTrigger: active state gets card/popover background.
 */
export function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex-col gap-3', className)}
      {...props}
    />
  );
}

export function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex-row items-center rounded-xl bg-muted p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  value,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { value: rootValue } = TabsPrimitive.useRootContext();
  const isActive = rootValue === value;
  return (
    <TextClassContext.Provider
      value={
        isActive
          ? 'text-foreground font-martian-extrabold'
          : 'text-muted-foreground font-martian-regular'
      }
    >
      <TabsPrimitive.Trigger
        value={value}
        className={cn(
          'flex-1 items-center justify-center rounded-lg py-2',
          isActive && 'bg-background shadow-brutal-sm',
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn(className)} {...props} />;
}
