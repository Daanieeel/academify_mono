import React from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import { Text } from '@/components/ui/text';

export type ThemedAttachementButtonProps = {
  label: string;
  emojiPath: ImageSourcePropType;
};

const ThemedAttachmentButton = (props: ThemedAttachementButtonProps) => {
  return (
    <View className="bg-neutral-200 rounded-[9999px] px-[12px] h-[35px] flex-row items-center gap-[10px]">
      <Image
        source={props.emojiPath}
        className="h-[20px] w-[20px] object-contain"
      ></Image>
      <Text variant="caption">{props.label}</Text>
    </View>
  );
};

export default ThemedAttachmentButton;
