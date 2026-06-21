import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';

export type ThemedListPreviewItemProps = {
  avatar?: React.ReactNode;
  userId: number | string;
  heading: string;
  caption?: string;
  showRemoveButton?: boolean;
  backgroundColor?: string;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
  className?: string;
};

const ThemedListPreviewItem = ({
  showRemoveButton = false,
  ...props
}: ThemedListPreviewItemProps) => {
  return (
    <View
      className="flex-row items-center justify-between bg-neutral-100"
      style={{
        backgroundColor: props.backgroundColor,
        paddingVertical: props.paddingVertical ?? 15,
        paddingHorizontal: props.paddingHorizontal,
        borderRadius: props.borderRadius,
      }}
    >
      <View className="flex-1 flex-row items-center gap-[20px]">
        <Avatar showBorder={false} size="small"></Avatar>
        <View className="flex-col items-start">
          <Text variant="body">{props.heading}</Text>
          <Text variant="body">{props.caption}</Text>
        </View>
      </View>
      {showRemoveButton && (
        <Button variant="destructive" className="p-[5px]">
          <Icon name="minus-circle" size={18} />
        </Button>
      )}
    </View>
  );
};

export default ThemedListPreviewItem;
