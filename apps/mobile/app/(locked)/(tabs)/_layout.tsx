import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const primary900Color = useThemeColor({}, 'primary-900');
  const neutral50Color = useThemeColor({}, 'neutral-50');
  const neutral900Color = useThemeColor({}, 'neutral-900');

  const getCustomIcon = (iconName: string) => {
    if (Platform.OS === 'ios') {
      switch (iconName) {
        case 'chat-circle':
          return require('../../../assets/images/app/tabs/chat-circle.png');
        case 'binoculars':
          return require('../../../assets/images/app/tabs/binoculars.png');
        case 'megaphone-simple':
          return require('../../../assets/images/app/tabs/megaphone-simple.png');
        case 'wrench':
          return require('../../../assets/images/app/tabs/wrench.png');
      }
    }
    return undefined; // Android falls back to md
  };

  return (
    <NativeTabs
      tintColor={primary900Color}
      labelStyle={{
        color: neutral900Color,
      }}
    >
      <NativeTabs.Trigger
        name="chats"
        contentStyle={{ backgroundColor: neutral50Color }}
      >
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={getCustomIcon('chat-circle')}
          renderingMode="template"
          md="chat"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="explore"
        contentStyle={{ backgroundColor: neutral50Color }}
      >
        <NativeTabs.Trigger.Label>Entdecken</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={getCustomIcon('binoculars')}
          renderingMode="template"
          md="explore"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="blackboards"
        contentStyle={{ backgroundColor: neutral50Color }}
      >
        <NativeTabs.Trigger.Label>Blackboards</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={getCustomIcon('megaphone-simple')}
          renderingMode="template"
          md="campaign"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="settings"
        contentStyle={{ backgroundColor: neutral50Color }}
      >
        <NativeTabs.Trigger.Label>Einstellungen</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={getCustomIcon('wrench')}
          renderingMode="template"
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
