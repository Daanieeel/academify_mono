import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Image } from 'expo-image';

// ─── Design tokens (mirrors global.css light theme) ────────────────────────
const C = {
  primary: '#6b3314',
  primaryFg: '#faf6ef',
  secondary: '#dcd9cc',
  foreground: '#27231c',
  background: '#f6f4ef',
} as const;

// ─── Chat sequence ──────────────────────────────────────────────────────────
interface Message {
  readonly id: number;
  readonly side: 'left' | 'right';
  readonly text: string;
  readonly highlight?: boolean;
}

const MESSAGES: readonly Message[] = [
  { id: 0, side: 'left', text: 'Noch ein\nSchulmessenger?' },
  { id: 1, side: 'right', text: 'Ja. Aber hier kommen\nNachrichten auch an.' },
  { id: 2, side: 'left', text: 'Ernsthaft?' },
  {
    id: 3,
    side: 'right',
    text: 'Endlich einer,\nder zuhört.',
    highlight: true,
  },
] as const;

// ─── Sequence timings (ms) ───────────────────────────────────────────────────
const SEQ = {
  bubble0: 560,
  typing1: 1080,
  bubble1: 2080,
  typing2: 2640,
  bubble2: 3200,
  typing3: 3720,
  bubble3: 4440,
} as const;

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingIndicator({ side }: { readonly side: 'left' | 'right' }) {
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

// ─── Chat bubble ─────────────────────────────────────────────────────────────
function ChatBubble({
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

// ─── Landing page ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const router = useRouter();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const b0Anim = useRef(new Animated.Value(0)).current;
  const b1Anim = useRef(new Animated.Value(0)).current;
  const b2Anim = useRef(new Animated.Value(0)).current;
  const b3Anim = useRef(new Animated.Value(0)).current;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [visibleCount, setVisibleCount] = useState(0);
  const [typingSide, setTypingSide] = useState<'left' | 'right' | null>(null);

  const bubbleAnims: ReadonlyArray<Animated.Value> = [
    b0Anim,
    b1Anim,
    b2Anim,
    b3Anim,
  ];

  useEffect(() => {
    let mounted = true;

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        if (mounted) {fn();}
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
      if (!mounted) {return;}

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
  }, []);

  const logoY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-56, 0],
  });

  const handleNavigate = () => {
    timersRef.current.forEach(clearTimeout);
    router.push('/(auth)/institution-picker');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
        {/* ── Logotype stamp ── */}
        <Animated.View
          style={{
            alignSelf: 'flex-start',
            opacity: logoAnim,
            transform: [{ translateY: logoY }, { rotate: '-2deg' }],
            marginBottom: 32,
          }}
        >
          <View
            style={{
              paddingHorizontal: 22,
              paddingVertical: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.foreground,
              backgroundColor: C.primary,
              shadowColor: C.foreground,
              shadowOffset: { width: 5, height: 5 },
              shadowOpacity: 1,
              shadowRadius: 0,
            }}
          >
            <Text
              className="font-martian-black-narrow text-[46px] leading-[50px] tracking-[-1px]"
              style={{ color: C.primaryFg }}
            >
              academi.fy
            </Text>
          </View>
        </Animated.View>

        {/* ── Chat conversation ── */}
        <View style={{ flex: 1 }}>
          {(MESSAGES.slice(0, visibleCount) as Message[]).map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              anim={bubbleAnims[msg.id] as Animated.Value}
            />
          ))}
          {typingSide !== null && <TypingIndicator side={typingSide} />}
        </View>

        {/* ── CTA dock ── */}
        <View
          style={{
            gap: 10,
            paddingBottom: 8,
          }}
        >
          <Button variant="default" size="lg" onPress={handleNavigate}>
            <Icon name="sign-in" size={22} />
            <Text>Anmeldung starten</Text>
          </Button>
          <Button variant="untis" size="lg" onPress={handleNavigate}>
            <Image
              style={{ width: 24, height: 24, borderRadius: 4 }}
              source={{
                uri: 'https://www.untis.at/fileadmin/user_upload/Icon-1024x1024.svg',
              }}
              contentFit="contain"
            />
            <Text>Mit Untis anmelden</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LandingPage;
