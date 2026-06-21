import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as TabsPrimitive from '@rn-primitives/tabs';
import type * as React from 'react';

export function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex-col gap-[10px]', className)}
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
      className={cn(
        'flex-row items-center rounded-[18px] bg-neutral-200 p-[5px]',
        className,
      )}
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
      value={isActive ? 'text-neutral-900' : 'text-neutral-600'}
    >
      <TabsPrimitive.Trigger
        value={value}
        className={cn(
          'flex-1 items-center justify-center rounded-[13px] py-[8px]',
          isActive && 'bg-neutral-50',
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
