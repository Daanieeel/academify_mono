import ThemedProfilePreview from '@/components/pages/settings/themed-profile-preview';
import { Separator } from '@/components/ui/separator';

import ThemedSettingsItem, {
  ThemedSettingsItemProp,
} from '@/components/pages/settings/themed-settings-item';
import ThemedHeader from '@/components/themed-header';
import ThemedPressable from '@/components/themed-pressable';
import ThemedSearchBar from '@/components/themed-search-bar';
import { useSession } from '@/context/auth-context';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const settingsItems: ThemedSettingsItemProp[] = [
  {
    label: 'Dark Mode',
    icomoonIcon: 'moon-stars',
    type: 'switch',
    onPressAction: 'dark-mode-press-action',
  },
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
  const [searchBarValue, setSearchBarValue] = useState('');
  const { signOut } = useSession();
  const router = useRouter();

  const onLogOutPressed = () => {
    console.log('from settings page: user clicked log out');
    signOut();
    router.dismissTo('/');
  };

  const onDarkModePressed = () => {
    console.log('From Settings Page: Dark mode trigger pressed');
  };

  const defaultPressedAction = () => {
    console.log('From Settings Page: default action tapped');
  };

  const settingsActionHandler: Record<string, () => void> = {
    'log-out-press-action': onLogOutPressed,
    'dark-mode-press-action': onDarkModePressed,
    'show-help-press-action': defaultPressedAction,
    default: defaultPressedAction,
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView>
        <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
        <ThemedHeader
          headerTitle={'Einstellungen'}
          headerSearchBar={
            <ThemedSearchBar
              placeholder="Nach Einstellung suchen.."
              value={searchBarValue}
              onInputChanged={setSearchBarValue}
            ></ThemedSearchBar>
          }
        ></ThemedHeader>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 50,
        }}
        className="px-[15px]"
      >
        <ThemedPressable onPress={() => {}}>
          <ThemedProfilePreview
            firstName="Maxine"
            lastName="Maxwell"
            username={'@mmaxwell'}
            badges={[
              {
                icomoonIconName: 'student',
                label: 'Schüler',
              },
              {
                icomoonIconName: 'graduation-cap',
                label: '9D',
              },
            ]}
          ></ThemedProfilePreview>
        </ThemedPressable>

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
