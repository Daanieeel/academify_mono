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
  const bgColorClass =
    type === 'inverted' ? 'bg-neutral-900' : 'bg-neutral-200';
  const textColorClass =
    type === 'inverted' ? 'text-neutral-200' : 'text-neutral-900';

  return (
    <View
      className={`rounded-[18px] max-w-[70%] p-[12px] ${bgColorClass}`}
      style={style}
    >
      <Text variant="heading2" className={textColorClass}>
        {content}
      </Text>
    </View>
  );
};

export default LandingPageSpeachBubble;
