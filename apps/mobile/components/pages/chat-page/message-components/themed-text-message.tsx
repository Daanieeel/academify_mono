import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { View } from 'react-native';

export type ThemedTextMessageProps = {
  message: string;
};

const ThemedTextMessage = ({ ...props }: ThemedTextMessageProps) => {
  return (
    <View>
      <ThemedText type="body">{props.message}</ThemedText>
    </View>
  );
};

export default ThemedTextMessage;
