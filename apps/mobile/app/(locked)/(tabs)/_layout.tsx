import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/api-client';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const TAB_ICON_SIZE = 128;

export default function TabLayout() {
  const primary900Color = useThemeColor({}, 'primary-900');
  const neutral50Color = useThemeColor({}, 'neutral-50');
  const neutral900Color = useThemeColor({}, 'neutral-900');

  const [avatarBackgroundColor, setAvatarBackgroundColor] = useState<
    string | null
  >(null);
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null);
  const [tabIconUri, setTabIconUri] = useState<string | undefined>(undefined);
  const captureTargetRef = useRef<View>(null);

  useEffect(() => {
    api
      .getMe()
      .then((me) => {
        setAvatarBackgroundColor(me.avatar_background_color);
        setAvatarEmoji(me.avatar_emoji);
      })
      .catch(console.error);
  }, []);

  // The native tab bar icon needs a real bitmap — it can't render a live
  // React component (expo-router only special-cases VectorIcon/PromiseIcon
  // elements as `src`, see node_modules/expo-router/build/native-tabs/utils/icon.js).
  // So we render the avatar off-screen and snapshot it to a data URI whenever
  // it changes, falling back to the person icon until that resolves.
  useEffect(() => {
    if (!avatarBackgroundColor || !avatarEmoji || !captureTargetRef.current) {
      setTabIconUri(undefined);
      return;
    }
    const timeout = setTimeout(() => {
      if (!captureTargetRef.current) {
        return;
      }
      captureRef(captureTargetRef, {
        format: 'png',
        quality: 1,
        result: 'data-uri',
        width: TAB_ICON_SIZE,
        height: TAB_ICON_SIZE,
      })
        .then(setTabIconUri)
        .catch(console.error);
    }, 0);
    return () => clearTimeout(timeout);
  }, [avatarBackgroundColor, avatarEmoji]);

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
      }
    }
    return undefined; // Android falls back to md
  };

  return (
    <>
      {/* Off-screen — only ever used as a snapshot source for the Settings
          tab icon, never actually shown to the user. */}
      <View
        collapsable={false}
        ref={captureTargetRef}
        style={{
          position: 'absolute',
          top: -9999,
          left: -9999,
          height: TAB_ICON_SIZE,
          width: TAB_ICON_SIZE,
          borderRadius: TAB_ICON_SIZE / 2,
          backgroundColor: avatarBackgroundColor ?? 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: TAB_ICON_SIZE * 0.55 }}>
          {avatarEmoji ?? ''}
        </Text>
      </View>

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
          <NativeTabs.Trigger.Label>Optionen</NativeTabs.Trigger.Label>
          {tabIconUri ? (
            <NativeTabs.Trigger.Icon
              src={{ uri: tabIconUri }}
              renderingMode="original"
            />
          ) : (
            <NativeTabs.Trigger.Icon
              sf={{
                default: 'person.crop.circle',
                selected: 'person.crop.circle.fill',
              }}
              md="account_circle"
            />
          )}
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
