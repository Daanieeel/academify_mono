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
          return {
            default: require('../../../assets/images/app/tabs/chat-circle.png'),
            selected: require('../../../assets/images/app/tabs/chat-circle-fill.png'),
          };
        case 'binoculars':
          return {
            default: require('../../../assets/images/app/tabs/binoculars.png'),
            selected: require('../../../assets/images/app/tabs/binoculars-fill.png'),
          };
        case 'megaphone-simple':
          return {
            default: require('../../../assets/images/app/tabs/megaphone-simple.png'),
            selected: require('../../../assets/images/app/tabs/megaphone-simple-fill.png'),
          };
        case 'wrench':
          return {
            default: require('../../../assets/images/app/tabs/wrench.png'),
            selected: require('../../../assets/images/app/tabs/wrench-fill.png'),
          };
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
