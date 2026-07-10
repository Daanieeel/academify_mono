import React from 'react';
import { Animated, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { C, type Message } from '../constants';

export function ChatBubble({
  message,
  anim,
}: {
  readonly message: Message;
  readonly anim: Animated.Value;
}) {
  const isRight = message.side === 'right';
  const isAccent = isRight && message.highlight === true;
  const bubbleBg = isAccent ? C.primary : C.secondary;
  const bubbleFg = isAccent ? C.primaryFg : C.foreground;
  const slideX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [isRight ? 28 : -28, 0],
  });

  return (
    <Animated.View
      style={{
        alignSelf: isRight ? 'flex-end' : 'flex-start',
        opacity: anim,
        transform: [{ translateX: slideX }],
        marginBottom: 10,
        maxWidth: '78%',
      }}
    >
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.foreground,
          backgroundColor: bubbleBg,
          shadowColor: C.foreground,
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
        }}
      >
        <Text
          className="font-martian-extrabold text-[16px] leading-[22px]"
          style={{ color: bubbleFg }}
        >
          {message.text}
        </Text>
      </View>
    </Animated.View>
  );
}
