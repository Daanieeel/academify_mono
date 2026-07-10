import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Animated, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Image } from 'expo-image';

import { C, MESSAGES, type Message } from './constants';
import { TypingIndicator } from './_components/typing-indicator';
import { ChatBubble } from './_components/chat-bubble';
import { useChatSequence } from './use-chat-sequence';

// ─── Landing page ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const router = useRouter();

  const {
    logoAnim,
    logoY,
    bubbleAnims,
    visibleCount,
    typingSide,
    clearTimers,
  } = useChatSequence();

  const handleNavigate = () => {
    clearTimers();
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
