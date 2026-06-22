import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/lib/api-client';
import { parseAvatarGradient } from '@/lib/avatar';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { PixelRatio, Platform, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

// Displayed size = the captured PNG's point size (the slot draws bitmap
// pixels as points). TAB_ICON_PT is that on-screen size. For crispness we
// render the circle at TAB_ICON_PT points but snapshot at the device's
// native resolution (TAB_ICON_PT × DPR real pixels) and tag the source with
// that same `scale`, so it still displays at TAB_ICON_PT but is drawn from a
// full-resolution bitmap instead of a 9px one stretched 3x.
const TAB_ICON_PT = 9;
const PIXEL_RATIO = PixelRatio.get();

export default function TabLayout() {
  const primary900Color = useThemeColor({}, 'primary-900');
  const neutral50Color = useThemeColor({}, 'neutral-50');
  const neutral900Color = useThemeColor({}, 'neutral-900');

  // `<NativeTabs.Trigger>` renders null — it pushes its Label/Icon to native
  // via `navigation.setOptions()` inside a `useFocusEffect`, which only fires
  // while THAT tab is focused (see expo-router's NativeTabTrigger.js). So a
  // state update to the icon *after* NativeTabs has already mounted only
  // reaches native once the user actually visits that tab — looking at the
  // bar from another tab, it never updates. To avoid that entirely, we
  // resolve the avatar snapshot first and don't mount <NativeTabs> at all
  // until it's settled, so the Settings icon is correct on its first (and
  // only) render.
  const [ready, setReady] = useState(false);
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
        if (!me.avatar_background_color || !me.avatar_emoji) {
          setReady(true);
          return;
        }
        setAvatarBackgroundColor(me.avatar_background_color);
        setAvatarEmoji(me.avatar_emoji);
        // Let the offscreen view above render with the new color/emoji
        // before snapshotting it.
        setTimeout(() => {
          if (!captureTargetRef.current) {
            setReady(true);
            return;
          }
          captureRef(captureTargetRef, {
            format: 'png',
            quality: 1,
            result: 'data-uri',
            width: TAB_ICON_PT * PIXEL_RATIO,
            height: TAB_ICON_PT * PIXEL_RATIO,
          })
            .then(setTabIconUri)
            .catch(console.error)
            .finally(() => setReady(true));
        }, 50);
      })
      .catch(() => setReady(true));
  }, []);

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

  // Snapshot source for the Settings tab icon. Rendered on-screen, top-left,
  // fully opaque — NOT off-screen (views far outside the viewport get culled)
  // and NOT opacity:0 (a fully-transparent subtree snapshots blank). It's
  // only shown for the brief pre-mount window: while `!ready` this is the
  // whole tree, then NativeTabs (native, fullscreen, opaque) mounts over it.
  const captureGradient =
    parseAvatarGradient(avatarBackgroundColor) ?? (['#000', '#000'] as const);
  const captureTarget =
    avatarBackgroundColor && avatarEmoji ? (
      // Transparent canvas at the icon's point size, with the gradient circle
      // inset — captured (incl. the transparent margin) so the final icon
      // sits in the same footprint as the bundled glyphs.
      <LinearGradient
        // @ts-expect-error -- ref forwards to the underlying View
        ref={captureTargetRef}
        collapsable={false}
        colors={captureGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: TAB_ICON_PT,
          width: TAB_ICON_PT,
          borderRadius: TAB_ICON_PT / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: TAB_ICON_PT * 0.6,
            transform: [{ translateY: -0.12 }, { translateX: 0.3 }],
          }}
        >
          {avatarEmoji}
        </Text>
      </LinearGradient>
    ) : null;

  if (!ready) {
    // Render the capture source alone until the snapshot resolves, so the
    // Settings icon is final on NativeTabs' first (and only) render.
    return <View style={{ flex: 1 }}>{captureTarget}</View>;
  }

  return (
    <NativeTabs
      tintColor={primary900Color}
      labelVisibilityMode="labeled"
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
        {tabIconUri && Platform.OS === 'ios' ? (
          <NativeTabs.Trigger.Icon
            src={{ uri: tabIconUri, scale: PIXEL_RATIO }}
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

      <NativeTabs.Trigger
        name="search"
        role="search"
        contentStyle={{ backgroundColor: neutral50Color }}
      >
        <NativeTabs.Trigger.Label>Suche</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'magnifyingglass',
            selected: 'magnifyingglass',
          }}
          md="search"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
