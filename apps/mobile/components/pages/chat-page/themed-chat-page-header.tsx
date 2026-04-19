import SmallButton from '@/components/buttons/small-button';
import ProfilePic from '@/components/profile-pic';
import ThemedPressable from '@/components/themed-pressable';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type ThemedChatPageHeaderProps = {
  onChatAboutPressed: () => void;
};

const ThemedChatPageHeader = (props: ThemedChatPageHeaderProps) => {
  const neutral900Color = useThemeColor({}, 'neutral-900');
  const neutral50Color = useThemeColor({}, 'neutral-50');

  const onBackButtonPressed = () => {
    router.back();
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles['main-container'],
        {
          borderBottomColor: neutral900Color,
          backgroundColor: neutral50Color,
        },
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <SmallButton
          iconSize={25}
          onPress={onBackButtonPressed}
          iconName="arrow-left"
        ></SmallButton>
        <ThemedPressable onPress={props.onChatAboutPressed}>
          <View
            style={{
              gap: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <ProfilePic size={'small'}></ProfilePic>
            <ThemedText type="body">Bio K1A24</ThemedText>
          </View>
        </ThemedPressable>
      </View>
      <SmallButton
        iconSize={25}
        onPress={() => {}}
        iconName="dots-three-circle"
      ></SmallButton>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  'main-container': {
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    paddingTop: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 9999,
  },
});

export default ThemedChatPageHeader;
