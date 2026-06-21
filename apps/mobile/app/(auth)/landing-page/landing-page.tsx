import LandingPageSpeachBubble from '@/components/pages/landing-page/landing-page-speach-bubble';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LandingPage = () => {
  const handleLoginButtonPress = () => {
    console.warn('Login button pressed');
    router.push('/(auth)/username-page');
  };

  const handleUntisLoginButtonPress = () => {};

  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
      <View className="flex-1 flex-col p-[15px]">
        <View className="flex-1">
          <View className="w-100vw shrink z-[1]">
            <LandingPageSpeachBubble
              className="max-w-[65%]"
              style={{ transform: [{ rotate: '352deg' }] }}
              type="inverted"
              content={APPLICATION_CONSTANTS.LANDING_BUBBLE_1}
            ></LandingPageSpeachBubble>
          </View>
          <View className="w-100vw display-flex items-end shrink">
            <LandingPageSpeachBubble
              className="max-w-[75%]"
              style={{ transform: [{ rotate: '4deg' }] }}
              type="normal"
              content={APPLICATION_CONSTANTS.LANDING_BUBBLE_2}
            ></LandingPageSpeachBubble>
          </View>
          <View className="flex-1">
            <Image
              className="flex-1 h-full w-[50%]"
              style={{ resizeMode: 'contain' }}
              source={require('@/assets/images/app/wild-boar.png')}
            ></Image>
          </View>
        </View>
        <View className="shrink gap-[10px]">
          <Button variant="primary" size="lg" onPress={handleLoginButtonPress}>
            <Text>{APPLICATION_CONSTANTS.LANDING_BUTTON_1}</Text>
            <Icon name="arrow-right" size={24} />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onPress={handleUntisLoginButtonPress}
          >
            <Image
              className="h-[26px] w-[26px]"
              source={require('@/assets/images/app/untis-3x.png')}
            />
            <Text color={useThemeColor({}, 'untis-orange')}>
              {APPLICATION_CONSTANTS.LANDING_BUTTON_2}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Style Sheet for additional styles (object-contain not implemented in nativewind)

export default LandingPage;
