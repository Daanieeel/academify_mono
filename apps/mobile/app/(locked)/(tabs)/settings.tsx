import ThemedProfilePreview from '@/components/pages/settings/themed-profile-preview';
import { ThemedSchoolSwitcherModal } from '@/components/modals/themed-school-switcher-modal';
import ThemedAvatarPickerModal from '@/components/modals/themed-avatar-picker-modal';
import { Separator } from '@/components/ui/separator';

import ThemedSettingsItem, {
  ThemedSettingsItemProp,
} from '@/components/pages/settings/themed-settings-item';
import ThemedHeader from '@/components/themed-header';
import ThemedPressable from '@/components/themed-pressable';
import { useSession } from '@/context/auth-context';
import { api } from '@/lib/api-client';
import { formatRoleIcon, formatRoleLabel } from '@/lib/format';
import { Stack, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState, useRef } from 'react';
import {
  ScrollView,
  View,
  DeviceEventEmitter,
  PixelRatio,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { parseAvatarGradient } from '@/lib/avatar';

const TAB_ICON_PT = 9;
const PIXEL_RATIO = PixelRatio.get();

const accountSettingsItems: ThemedSettingsItemProp[] = [
  {
    label: 'Schule wechseln',
    icomoonIcon: 'buildings',
    type: 'link',
    onPressAction: 'switch-school-press-action',
  },
  {
    label: 'Über die App',
    icomoonIcon: 'info',
    type: 'link',
    onPressAction: 'about-press-action',
  },
  {
    label: 'Hilfe erhalten',
    icomoonIcon: 'lifebuoy',
    type: 'link',
    onPressAction: 'show-help-press-action',
  },
  {
    label: 'Abmelden',
    icomoonIcon: 'sign-out',
    type: 'link',
    onPressAction: 'log-out-press-action',
  },
];

const schoolSettingsItems: ThemedSettingsItemProp[] = [
  {
    label: 'Benachrichtigungen',
    icomoonIcon: 'bell',
    type: 'switch',
    onPressAction: 'notification-press-action',
  },
];

const Settings = () => {
  const router = useRouter();
  const { signOut } = useSession();
  const captureTargetRef = useRef<View>(null);
  const [avatarPickerShown, setAvatarPickerShown] = useState(false);
  const [schoolSwitcherShown, setSchoolSwitcherShown] = useState(false);
  const queryClient = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data, error } = await api.me.get();
      if (error) {
        throw error;
      }
      return data;
    },
  });

  const [firstName, ...lastNameParts] = me?.display_name?.split(' ') ?? [];
  const badges = [
    me?.role
      ? {
          icomoonIconName: formatRoleIcon(me.role)!,
          label: formatRoleLabel(me.role)!,
        }
      : undefined,
    me?.class_name
      ? { icomoonIconName: 'graduation-cap', label: me.class_name }
      : undefined,
  ].filter((badge): badge is NonNullable<typeof badge> => Boolean(badge));

  const onLogOutPressed = async () => {
    console.log('from settings page: user clicked log out');
    await signOut();
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/(auth)/landing-page/landing-page');
  };

  const defaultPressedAction = () => {
    console.log('From Settings Page: default action tapped');
  };

  const settingsActionHandler: Record<string, () => void> = {
    'log-out-press-action': onLogOutPressed,
    'switch-school-press-action': () => setSchoolSwitcherShown(true),
    'show-help-press-action': defaultPressedAction,
    default: defaultPressedAction,
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <View
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.01 }}
        pointerEvents="none"
      >
        <LinearGradient
          ref={captureTargetRef as any}
          collapsable={false}
          colors={
            parseAvatarGradient(me?.avatar_background_color) ?? ['#000', '#000']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            height: TAB_ICON_PT,
            width: TAB_ICON_PT,
            borderRadius: TAB_ICON_PT / 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RNText
            style={{
              fontSize: TAB_ICON_PT * 0.6,
              transform: [{ translateY: -0.12 }, { translateX: 0.3 }],
              fontFamily: 'MartianGrotesk-StdRg',
            }}
          >
            {me?.avatar_emoji}
          </RNText>
        </LinearGradient>
      </View>

      <SafeAreaView edges={['top']}>
        <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
        <ThemedHeader headerTitle={'Einstellungen'}></ThemedHeader>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 50,
        }}
        className="px-[15px]"
      >
        <ThemedProfilePreview
          firstName={firstName ?? ''}
          lastName={lastNameParts.join(' ')}
          username={me ? `@${me.username}` : ''}
          badges={badges}
          avatarBackgroundColor={me?.avatar_background_color}
          avatarEmoji={me?.avatar_emoji}
          onAvatarPress={() => setAvatarPickerShown(true)}
        ></ThemedProfilePreview>

        <ThemedAvatarPickerModal
          visible={avatarPickerShown}
          onRequestClose={() => setAvatarPickerShown(false)}
          currentBackgroundColor={me?.avatar_background_color}
          currentEmoji={me?.avatar_emoji}
          onSaved={({ backgroundColor, emoji }) => {
            queryClient.setQueryData(['me'], (prev: any) =>
              prev
                ? {
                    ...prev,
                    avatar_background_color: backgroundColor,
                    avatar_emoji: emoji,
                  }
                : prev,
            );
            setTimeout(() => {
              if (!captureTargetRef.current) {
                return;
              }
              captureRef(captureTargetRef, {
                format: 'png',
                quality: 1,
                result: 'data-uri',
                width: TAB_ICON_PT * PIXEL_RATIO,
                height: TAB_ICON_PT * PIXEL_RATIO,
              })
                .then((uri) =>
                  DeviceEventEmitter.emit('avatar_updated_uri', uri),
                )
                .catch(console.error);
            }, 50);
          }}
        ></ThemedAvatarPickerModal>

        <ThemedSchoolSwitcherModal
          visible={schoolSwitcherShown}
          onRequestClose={() => setSchoolSwitcherShown(false)}
        />

        <Separator className="my-[20px] mx-[20px]"></Separator>

        <View className="mb-[20px]">
          <RNText className="text-neutral-500 font-bold mb-[10px] ml-[5px] uppercase text-xs tracking-wider">
            Account-Einstellungen
          </RNText>
          <View className="gap-[10px]">
            {accountSettingsItems.map((item, key) => (
              <ThemedPressable
                key={key}
                onPress={settingsActionHandler[item.onPressAction ?? 'default']}
              >
                <ThemedSettingsItem {...item}></ThemedSettingsItem>
              </ThemedPressable>
            ))}
          </View>
        </View>

        <View className="mb-[20px]">
          <RNText className="text-neutral-500 font-bold mb-[10px] ml-[5px] uppercase text-xs tracking-wider">
            Schul-Einstellungen
          </RNText>
          <View className="gap-[10px]">
            {schoolSettingsItems.map((item, key) => (
              <ThemedPressable
                key={key}
                onPress={settingsActionHandler[item.onPressAction ?? 'default']}
              >
                <ThemedSettingsItem {...item}></ThemedSettingsItem>
              </ThemedPressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;
