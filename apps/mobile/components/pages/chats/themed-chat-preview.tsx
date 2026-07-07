import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export type ThemedChatPreviewProps = {
  chatName: string;
  chatIcon?: string;
  lastMessageTime?: string;
  lastMessage?: string;
  lastMessageType: 'text' | 'video' | 'audio' | 'file';
  read: boolean;
  isTemporary?: boolean;
  onDismiss?: () => void;
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
    <View
      className={cn(
        'h-[80px] items-center flex-row gap-[15px]',
        props.isTemporary
          ? 'border border-dashed border-neutral-300 rounded-[12px] p-[10px] -mx-[10px]'
          : '',
      )}
    >
      <Avatar size={'md'} source={props.chatIcon}></Avatar>
      <View className="gap-[2px] flex-col flex-1 justify-start">
        <View className="flex-row justify-between items-center">
          <Text
            numberOfLines={1}
            variant="body"
            className="text-neutral-900 font-bold"
          >
            {props.chatName}
          </Text>

          {/* Last message time + unread badge or dismiss button */}
          {props.isTemporary ? (
            <Button
              variant="secondary"
              className="p-0 h-[30px] w-[30px] rounded-full"
              onPress={props.onDismiss}
            >
              <Icon name="x" size={16} className="text-neutral-500" />
            </Button>
          ) : (
            <View className="flex-row items-center gap-[5px]">
              <Text
                numberOfLines={1}
                variant="body"
                className={cn(
                  'text-[12px] leading-[16px]',
                  read ? 'text-neutral-500' : 'text-neutral-900',
                )}
              >
                {props.lastMessageTime ?? ''}
              </Text>
              {read === true ? null : (
                <View className="w-[5px] h-[5px] rounded-[9999px] bg-red-500"></View>
              )}
            </View>
          )}
        </View>
        <Text
          numberOfLines={2}
          variant="body"
          className={cn('text-[13px] leading-[18px] text-neutral-500')}
        >
          {props.isTemporary
            ? 'Noch keine Nachrichten'
            : lastMessageEmoji +
              (lastMessageEmoji ? ' ' : '') +
              (props.lastMessage ?? 'Noch keine Nachrichten')}
        </Text>
      </View>
    </View>
  );
};

export default ThemedChatPreview;
