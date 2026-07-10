import { useEffect, useRef, useState, useMemo } from 'react';
import { Animated } from 'react-native';
import { SEQ } from './constants';

export function useChatSequence() {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const b0Anim = useRef(new Animated.Value(0)).current;
  const b1Anim = useRef(new Animated.Value(0)).current;
  const b2Anim = useRef(new Animated.Value(0)).current;
  const b3Anim = useRef(new Animated.Value(0)).current;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [visibleCount, setVisibleCount] = useState(0);
  const [typingSide, setTypingSide] = useState<'left' | 'right' | null>(null);

  const bubbleAnims = useMemo(
    () => [b0Anim, b1Anim, b2Anim, b3Anim],
    [b0Anim, b1Anim, b2Anim, b3Anim],
  );

  useEffect(() => {
    let mounted = true;

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        if (mounted) {
          fn();
        }
      }, delay);
      timersRef.current.push(id);
    }

    function spring(
      anim: Animated.Value,
      toValue: number,
      speed = 22,
      bounciness = 4,
    ) {
      Animated.spring(anim, {
        toValue,
        useNativeDriver: true,
        speed,
        bounciness,
      }).start();
    }

    function showBubble(index: number) {
      setVisibleCount(index + 1);
      setTypingSide(null);
      spring(bubbleAnims[index] as Animated.Value, 1);
    }

    function runSequence() {
      if (!mounted) {
        return;
      }

      // Reset
      setVisibleCount(0);
      setTypingSide(null);
      logoAnim.setValue(0);
      bubbleAnims.forEach((a) => (a as Animated.Value).setValue(0));

      // Logotype stamp
      spring(logoAnim, 1, 14, 7);

      // Conversation
      schedule(() => showBubble(0), SEQ.bubble0);
      schedule(() => setTypingSide('right'), SEQ.typing1);
      schedule(() => showBubble(1), SEQ.bubble1);
      schedule(() => setTypingSide('left'), SEQ.typing2);
      schedule(() => showBubble(2), SEQ.bubble2);
      schedule(() => setTypingSide('right'), SEQ.typing3);
      schedule(() => showBubble(3), SEQ.bubble3);
    }

    runSequence();

    return () => {
      mounted = false;
      timersRef.current.forEach(clearTimeout);
    };
  }, [logoAnim, bubbleAnims]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
  };

  const logoY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-56, 0],
  });

  return {
    logoAnim,
    logoY,
    bubbleAnims,
    visibleCount,
    typingSide,
    clearTimers,
  };
}
