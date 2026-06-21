import React from 'react';
import { Image, View } from 'react-native';
import { Text } from '@/components/ui/text';

export type ThemedAttachmentMessageProps = {
  userIsSender?: boolean;
  attachmentName: string;
  attachmentSize: string;
  attachmentFileType: string;
};

export default function ThemedAttachmentMessage(
  props: ThemedAttachmentMessageProps,
) {
  return (
    <View
      className={`flex-row items-center gap-[20px] rounded-[13px] p-[15px] ${props.userIsSender ? 'bg-primary-100' : 'bg-neutral-100'}`}
    >
      <Image
        className="h-[40px] w-[40px]"
        source={require('@/assets/images/app/emojis/page-emoji.png')}
      ></Image>
      <View className="flex-col items-start gap-[2px]">
        <Text
          className={
            props.userIsSender ? 'text-primary-900' : 'text-neutral-900'
          }
          numberOfLines={1}
          variant="body"
        >
          {props.attachmentName}
        </Text>
        <Text
          className={
            props.userIsSender ? 'text-primary-900' : 'text-neutral-900'
          }
          numberOfLines={1}
          variant="caption"
        >
          {props.attachmentFileType + ' • ' + props.attachmentSize}
        </Text>
      </View>
    </View>
  );
}
