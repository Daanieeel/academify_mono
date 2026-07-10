import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { C } from '../constants';

export function TypingIndicator({ side }: { readonly side: 'left' | 'right' }) {
  const isRight = side === 'right';
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (d: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(d, {
            toValue: 1,
            duration: 270,
            useNativeDriver: true,
          }),
          Animated.timing(d, {
            toValue: 0.3,
            duration: 270,
            useNativeDriver: true,
          }),
        ]),
      );
    const anim = Animated.parallel([
      pulse(d1, 0),
      pulse(d2, 160),
      pulse(d3, 320),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  const dotColor = isRight ? C.primaryFg : C.foreground;

  return (
    <View
      style={{
        alignSelf: isRight ? 'flex-end' : 'flex-start',
        marginBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.foreground,
          backgroundColor: isRight ? C.primary : C.secondary,
          shadowColor: C.foreground,
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
        }}
      >
        {[d1, d2, d3].map((d, i) => (
          <Animated.View
            key={i}
            style={{
              opacity: d,
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: dotColor,
              marginHorizontal: 2.5,
            }}
          />
        ))}
      </View>
    </View>
  );
}
