import ThemedAcademiBackground from '@/components/themed-academi-background';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';

const UserCardPage = () => {
  const userName = useLocalSearchParams().id;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = () => {
    router.push(`/(auth)/profile-edit-page/${userName}`);
  };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [scaleAnim]);

  const neutral900Color = useThemeColor({}, 'neutral-900');
  const green500Color = useThemeColor({}, 'green-500');
  const neutral400Color = useThemeColor({}, 'neutral-400');

  return (
    <View className="flex-1 p-[20px] bg-neutral-50">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <Button onPress={handleBackButtonPress}>
              <Icon name="arrow-left" />
              <Text>Zurück</Text>
            </Button>
          ),
        }}
      ></Stack.Screen>

      <ThemedAcademiBackground></ThemedAcademiBackground>
      <View className="bg-transparent absolute justify-center items-center top-0 left-0 bottom-0 right-0">
        <Animated.View
          className="h-[65%] max-h-[430px] w-[80%] rounded-[20px] items-center justify-between py-[10%] px-[20px] z-[1] bg-neutral-50 border-[2.5px] border-neutral-900"
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          <Avatar
            size="extra-large"
            customBorderColor={neutral400Color}
          ></Avatar>
          <Icon name="hand-peace" size={60} color={green500Color}></Icon>
          <View className="gap-[10px] items-center">
            <Text
              className="text-center"
              color={neutral900Color}
              variant="heading2"
            >{`${userName}!`}</Text>
            <Text
              className="text-center"
              color={neutral900Color}
              variant="body"
            >
              {APPLICATION_CONSTANTS.USER_CARD_PAGE_GREETING}
            </Text>
          </View>
        </Animated.View>
        <SafeAreaView className="w-[80%] absolute bottom-[20px]">
          <Button
            variant="primary"
            size="lg"
            onPress={handleContinueButtonPress}
          >
            <Text>Weiter</Text>
            <Icon name="arrow-right" size={24} />
          </Button>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default UserCardPage;
