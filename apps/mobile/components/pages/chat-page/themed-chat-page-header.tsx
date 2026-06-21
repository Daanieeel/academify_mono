import ThemedPressable from '@/components/themed-pressable';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';

export type ThemedChatPageHeaderProps = {
  onChatAboutPressed: () => void;
  chatName?: string;
};

const ThemedChatPageHeader = (props: ThemedChatPageHeaderProps) => {
  const onBackButtonPressed = () => {
    router.back();
  };

  return (
    <SafeAreaView
      edges={['top']}
      className="px-[15px] pb-[10px] border-b-[1.5px] pt-[20px] w-[100%] flex-row justify-between items-center z-[9999] border-b-neutral-900 bg-neutral-50"
    >
      <View className="flex-row items-center gap-[20px]">
        <Button variant="normal" onPress={onBackButtonPressed}>
          <Icon name="arrow-left" size={25} />
        </Button>
        <ThemedPressable onPress={props.onChatAboutPressed}>
          <View className="gap-[10px] flex-row items-center">
            <Avatar size={'small'}></Avatar>
            <Text variant="body">{props.chatName ?? 'Bio K1A24'}</Text>
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
