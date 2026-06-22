import ThemedProfilePreview from '@/components/pages/settings/themed-profile-preview';
import ThemedAvatarPickerModal from '@/components/modals/themed-avatar-picker-modal';
import { Separator } from '@/components/ui/separator';

import ThemedSettingsItem, {
  ThemedSettingsItemProp,
} from '@/components/pages/settings/themed-settings-item';
import ThemedHeader from '@/components/themed-header';
import ThemedPressable from '@/components/themed-pressable';
import { useSession } from '@/context/auth-context';
import { api, type MeResponse } from '@/lib/api-client';
import { formatRoleIcon, formatRoleLabel } from '@/lib/format';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const settingsItems: ThemedSettingsItemProp[] = [
  {
    label: 'Benachrichtigungen',
    icomoonIcon: 'bell',
    type: 'switch',
    onPressAction: 'notification-press-action',
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
    label: 'Log Out',
    icomoonIcon: 'sign-out',
    type: 'link',
    onPressAction: 'log-out-press-action',
  },
];

const Settings = () => {
  const [me, setMe] = useState<MeResponse | undefined>(undefined);
  const [avatarPickerShown, setAvatarPickerShown] = useState(false);
  const { signOut } = useSession();
  const router = useRouter();

  useEffect(() => {
    api.getMe().then(setMe).catch(console.error);
  }, []);

  const [firstName, ...lastNameParts] = me?.display_name.split(' ') ?? [];
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
    'show-help-press-action': defaultPressedAction,
    default: defaultPressedAction,
  };

  return (
    <View className="flex-1 bg-neutral-50">
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
          onSaved={({ backgroundColor, emoji }) =>
            setMe((prev) =>
              prev
                ? {
                    ...prev,
                    avatar_background_color: backgroundColor,
                    avatar_emoji: emoji,
                  }
                : prev,
            )
          }
        ></ThemedAvatarPickerModal>

        <Separator className="my-[20px] mx-[20px]"></Separator>

        <View className="gap-[10px]">
          {settingsItems.map((item, key) => (
            <ThemedPressable
              key={key}
              onPress={settingsActionHandler[item.onPressAction ?? 'default']}
            >
              <ThemedSettingsItem {...item}></ThemedSettingsItem>
            </ThemedPressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;
