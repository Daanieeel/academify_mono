import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedPressable from '@/components/themed-pressable';
import { router } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedChatPageHeaderProps = {
  onChatAboutPressed: () => void;
  chatName?: string;
};

const ThemedChatPageHeader = (props: ThemedChatPageHeaderProps) => {
  const onBackButtonPressed = () => {
    router.back();
  };

  const bgGradientStart = useThemeColor({}, 'neutral-50');

  return (
    <SafeAreaView
      edges={['top']}
      className="px-[15px] pb-[10px] pt-[20px] w-[100%] flex-row justify-between items-center bg-transparent"
    >
      <BlurView
        intensity={50}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(250, 250, 245, 1)', 'rgba(250, 250, 245, 0)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View className="flex-row items-center gap-[20px]">
        <Button variant="normal" onPress={onBackButtonPressed}>
          <Icon name="arrow-left" size={25} />
        </Button>
        <ThemedPressable onPress={props.onChatAboutPressed}>
          <View className="gap-[10px] flex-row items-center">
            <Avatar size={'small'}></Avatar>
            <Text variant="body">{props.chatName ?? 'Chat'}</Text>
          </View>
        </ThemedPressable>
      </View>
      <Button variant="normal" onPress={() => {}}>
        <Icon name="dots-three-circle" size={25} />
      </Button>
    </SafeAreaView>
  );
};

export default ThemedChatPageHeader;
