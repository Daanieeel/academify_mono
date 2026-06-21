import React from 'react';
import { View } from 'react-native';
import ThemedAttachmentMessage, {
  ThemedAttachmentMessageProps,
} from './themed-attachment-message';
import ThemedImageMessage, {
  ThemedImageMessageProps,
} from './themed-image-message';
import ThemedTextMessage, {
  ThemedTextMessageProps,
} from './themed-text-message';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export type ThemedMessageWrapperProps = {
  messageId: string;
  userIsSender: boolean;
  imageContent?: ThemedImageMessageProps;
  textContent?: ThemedTextMessageProps;
  attachmentContents?: ThemedAttachmentMessageProps[];
  senderName: string;
  sendDate: string;
  messageStatus?: 'sent' | 'loading';
};

const ThemedMessageWrapper = ({ ...props }: ThemedMessageWrapperProps) => {
  return (
    <View
      className={`max-w-[80%] pb-[10px] flex-col rounded-[18px] gap-[0px] ${props.imageContent ? 'min-w-[80%]' : ''} ${props.userIsSender ? 'self-end bg-primary-400' : 'self-start bg-neutral-50'}`}
    >
      {props.imageContent && (
        <View className="pt-[5px] px-[5px]">
          <ThemedImageMessage
            userIsSender
            {...props.imageContent}
          ></ThemedImageMessage>
        </View>
      )}
      {props.attachmentContents && (
        <View className="px-[5px] pt-[5px]">
          {props.attachmentContents.map((attachmentProps, index) => (
            <ThemedAttachmentMessage
              key={index}
              {...attachmentProps}
            ></ThemedAttachmentMessage>
          ))}
        </View>
      )}
      {props.textContent && (
        <View className="pt-[15px] px-[15px]">
          <ThemedTextMessage {...props.textContent}></ThemedTextMessage>
        </View>
      )}
      <View
        className={`flex-row items-center pt-[15px] px-[15px] gap-[5px] ${props.userIsSender ? 'self-end' : 'self-start'}`}
      >
        <Text variant="caption">
          {props.senderName + ' • ' + props.sendDate}
        </Text>
        {props.messageStatus === 'loading' ? (
          <Icon size={15} name="spinner"></Icon>
        ) : undefined}
      </View>
    </View>
  );
};

export default ThemedMessageWrapper;
