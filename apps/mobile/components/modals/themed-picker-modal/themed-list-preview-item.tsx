import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type ThemedListPreviewItemProps = {
  avatar?: React.ReactNode;
  userId: number | string;
  heading: string;
  caption?: string;
  showRemoveButton?: boolean;
  onRemovePress?: () => void;
  showChevron?: boolean;
  backgroundColor?: string;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
  className?: string;
};

const ThemedListPreviewItem = ({
  showRemoveButton = false,
  showChevron = false,
  ...props
}: ThemedListPreviewItemProps) => {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between bg-neutral-100',
        props.className,
      )}
      style={{
        backgroundColor: props.backgroundColor,
        paddingVertical: props.paddingVertical ?? 15,
        paddingHorizontal: props.paddingHorizontal,
        borderRadius: props.borderRadius,
      }}
    >
      <View className="flex-1 flex-row items-center gap-[20px]">
        <Avatar showBorder={false} size="small"></Avatar>
        <View className="flex-col items-start gap-[2px]">
          <Text variant="body">{props.heading}</Text>
          {props.caption && (
            <Text variant="caption" className="text-neutral-600">
              {props.caption}
            </Text>
          )}
        </View>
      </View>
      {showRemoveButton && (
        <Button
          variant="destructive"
          className="p-[5px]"
          onPress={props.onRemovePress}
        >
          <Icon name="minus-circle" size={18} />
        </Button>
      )}
      {showChevron && !showRemoveButton && (
        <Icon name="caret-right" size={18} className="text-neutral-400" />
      )}
    </View>
  );
};

export default ThemedListPreviewItem;
