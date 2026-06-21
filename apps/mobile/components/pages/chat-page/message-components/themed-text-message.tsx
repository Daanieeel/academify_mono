import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export type ThemedTextMessageProps = {
  message: string;
};

const ThemedTextMessage = ({ ...props }: ThemedTextMessageProps) => {
  return (
    <View>
      <Text variant="body">{props.message}</Text>
    </View>
  );
};

export default ThemedTextMessage;
