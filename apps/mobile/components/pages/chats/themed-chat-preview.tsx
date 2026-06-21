import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';

export type ThemedChatPreviewProps = {
  chatName: string;
  chatIcon?: string;
  lastMessageTime?: string;
  lastMessage?: string;
  lastMessageType: 'text' | 'video' | 'audio' | 'file';
  read: boolean;
};

const ThemedChatPreview = ({
  lastMessageType = 'text',
  read = true,
  ...props
}: ThemedChatPreviewProps) => {
  let lastMessageEmoji;

  switch (lastMessageType) {
    case 'audio':
      lastMessageEmoji = '🎧';
      break;
    case 'video':
      lastMessageEmoji = '🎥';
      break;
    case 'file':
      lastMessageEmoji = '📃';
      break;
    case 'text':
      lastMessageEmoji = '';
      break;
  }

  return (
    <View className="h-[80px] items-center w-[100%] flex-row gap-[15px]">
      <Avatar size={'medium'} source={props.chatIcon}></Avatar>
      <View className="gap-[10px] flex-col flex-1 justify-start">
        <View className="flex-row justify-between">
          <Text numberOfLines={1} variant="body" className="text-neutral-900">
            {props.chatName}
          </Text>

          {/* Last message + unread badge */}
          <View className="flex-row items-center gap-[5px]">
            <Text
              numberOfLines={1}
              variant="caption"
              className={read ? 'text-neutral-500' : 'text-neutral-900'}
            >
              {props.lastMessageTime ?? ''}
            </Text>
            {read === true ? null : (
              <View className="w-[5px] h-[5px] rounded-[9999px] bg-red-500"></View>
            )}
          </View>
          {/* Last message + unread badge */}
        </View>
        <Text
          numberOfLines={2}
          variant="caption"
          className={read ? 'text-neutral-500' : 'text-neutral-900'}
        >
          {lastMessageEmoji + ' ' + props.lastMessage}
        </Text>
      </View>
    </View>
  );
};

export default ThemedChatPreview;
