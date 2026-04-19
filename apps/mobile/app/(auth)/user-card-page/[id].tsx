import SimpleButton from '@/components/buttons/simple-button';
import SmallButton from '@/components/buttons/small-button';
import IcomoonIcon from '@/components/IcomoonIcon';
import ProfilePic from '@/components/profile-pic';
import ThemedAcademiBackground from '@/components/themed-academi-background';
import { ThemedText } from '@/components/themed-text';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const neutral50Color = useThemeColor({}, 'neutral-50');
  const green500Color = useThemeColor({}, 'green-500');
  const neutral400Color = useThemeColor({}, 'neutral-400');

  return (
    <View
      style={[styles['main-container'], { backgroundColor: neutral50Color }]}
    >
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <SmallButton
              onPress={handleBackButtonPress}
              label="Zurück"
              iconName="arrow-left"
            ></SmallButton>
          ),
        }}
      ></Stack.Screen>

      <ThemedAcademiBackground></ThemedAcademiBackground>
      <View style={[styles['fullscreen-wrapper']]}>
        <Animated.View
          style={[
            styles['user-tile'],
            {
              backgroundColor: neutral50Color,
              borderColor: neutral900Color,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ProfilePic
            size="extra-large"
            customBorderColor={neutral400Color}
          ></ProfilePic>
          <IcomoonIcon
            name="hand-peace"
            size={60}
            color={green500Color}
          ></IcomoonIcon>
          <View style={{ gap: 10, alignItems: 'center' }}>
            <ThemedText
              style={{ textAlign: 'center' }}
              color={neutral900Color}
              type="heading2"
            >{`${userName}!`}</ThemedText>
            <ThemedText
              style={{ textAlign: 'center' }}
              color={neutral900Color}
              type="body"
            >
              {APPLICATION_CONSTANTS.USER_CARD_PAGE_GREETING}
            </ThemedText>
          </View>
        </Animated.View>
        <SafeAreaView style={styles['button-wrapper']}>
          <SimpleButton
            label={'Weiter'}
            onPress={handleContinueButtonPress}
            type={'primary'}
            icomoonIcon="arrow-right"
          ></SimpleButton>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  'main-container': {
    flex: 1,
    padding: 20,
  },
  'fullscreen-wrapper': {
    backgroundColor: 'transparent',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  'user-tile': {
    height: '65%',
    maxHeight: 430,
    width: '80%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '10%',
    paddingHorizontal: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2.5,
  },
  'profile-image': {
    borderRadius: 9999,
    width: '55%',
    height: '55%',
    aspectRatio: 1,
    borderWidth: 4,
  },
  'button-wrapper': {
    width: '80%',
    position: 'absolute',
    bottom: 20,
  },
});

export default UserCardPage;
