import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@rn-primitives/dialog';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const FullWindowOverlay =
  Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function DialogOverlay({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, 'asChild'> & {
  children?: React.ReactNode;
}) {
  return (
    <FullWindowOverlay>
      <DialogPrimitive.Overlay
        className={cn(
          'absolute bottom-0 left-0 right-0 top-0 justify-end bg-black/40',
          className,
        )}
        {...props}
        asChild
      >
        <Animated.View>{children}</Animated.View>
      </DialogPrimitive.Overlay>
    </FullWindowOverlay>
  );
}

function DialogContent({
  className,
  children,
  portalHost,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string;
}) {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <DialogPrimitive.Content
          className={cn(
            'w-full px-[15px] pt-[30px] bg-neutral-100 rounded-t-[24px]',
            className,
          )}
          {...props}
        >
          <Animated.View
            entering={SlideInDown.duration(250)}
            exiting={SlideOutDown.duration(200)}
          >
            <View className="absolute self-center rounded-[999px] top-[10px] w-[50px] h-[5px] bg-neutral-300" />
            <DialogClose
              className="absolute right-[15px] top-[10px] z-[1]"
              hitSlop={12}
            >
              <Icon name="x" size={20} className="text-neutral-600" />
            </DialogClose>
            {children}
          </Animated.View>
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  );
}

export { Dialog, DialogClose, DialogContent, DialogPortal, DialogTrigger };
