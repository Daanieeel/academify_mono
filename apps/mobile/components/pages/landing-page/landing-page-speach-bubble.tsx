import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Text } from '@/components/ui/text';

type LandingPageSpeachBubbleProps = {
  type: 'normal' | 'inverted';
  content: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

const LandingPageSpeachBubble = ({
  type = 'normal',
  content,
  style,
}: LandingPageSpeachBubbleProps) => {
  const bgColorClass = type === 'inverted' ? 'bg-primary' : 'bg-secondary';

  return (
    <View
      className={`rounded-[18px] max-w-[70%] p-[12px] ${bgColorClass}`}
      style={style}
    >
      <Text
        variant="h2"
        style={{
          color: type === 'inverted' ? 'hsl(38 50% 96%)' : 'hsl(25 25% 22%)',
        }}
      >
        {content}
      </Text>
    </View>
  );
};

export default LandingPageSpeachBubble;
