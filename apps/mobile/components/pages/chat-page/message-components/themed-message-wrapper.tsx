import IcomoonIcon from '@/components/IcomoonIcon';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ThemedAttachmentMessage, {
  ThemedAttachmentMessageProps,
} from './themed-attachment-message';
import ThemedImageMessage, {
  ThemedImageMessageProps,
} from './themed-image-message';
import ThemedTextMessage, {
  ThemedTextMessageProps,
} from './themed-text-message';

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
  const messageBackground = props.userIsSender
    ? useThemeColor({}, 'primary-400')
    : useThemeColor({}, 'neutral-50');

  return (
    <View
      style={[
        {
          maxWidth: '80%',
          minWidth: props.imageContent ? '80%' : undefined,
          alignSelf: props.userIsSender ? 'flex-end' : 'flex-start',
          backgroundColor: messageBackground,
        },
        styles['main-container'],
      ]}
    >
      {props.imageContent && (
        <View style={styles['image-wrapper']}>
          <ThemedImageMessage
            userIsSender
            {...props.imageContent}
          ></ThemedImageMessage>
        </View>
      )}
      {props.attachmentContents && (
        <View style={styles['attachment-wrapper']}>
          {props.attachmentContents.map((attachmentProps, index) => (
            <ThemedAttachmentMessage
              key={index}
              {...attachmentProps}
            ></ThemedAttachmentMessage>
          ))}
        </View>
      )}
      {props.textContent && (
        <View style={styles['text-wrapper']}>
          <ThemedTextMessage {...props.textContent}></ThemedTextMessage>
        </View>
      )}
      <View
        style={[
          {
            alignSelf: props.userIsSender ? 'flex-end' : 'flex-start',
            gap: 5,
          },
          styles['info-container'],
        ]}
      >
        <ThemedText type="caption">
          {props.senderName + ' • ' + props.sendDate}
        </ThemedText>
        {props.messageStatus === 'loading' ? (
          <IcomoonIcon size={15} name="spinner"></IcomoonIcon>
        ) : undefined}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  'main-container': {
    paddingBottom: 10,
    flexDirection: 'column',
    borderRadius: 18,
    gap: 0,
  },
  'info-container': {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  'text-wrapper': {
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  'image-wrapper': {
    paddingTop: 5,
    paddingHorizontal: 5,
  },
  'attachment-wrapper': {
    paddingHorizontal: 5,
    paddingTop: 5,
  },
});

export default ThemedMessageWrapper;
