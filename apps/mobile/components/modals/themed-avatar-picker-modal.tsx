import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api-client';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import ThemedModal from './themed-modal';
import ThemedSelectable from './themed-picker-modal/themed-selectable';

// Real photo upload doesn't exist yet (no storage wired up) — this is the
// stand-in: pick a background color + an emoji, same idea as Snapchat/BeReal's
// generated-avatar picker. Hex literals, not theme classNames — these get
// stored as-is and applied via a literal `style.backgroundColor`, which can't
// resolve a `var(--color-x)` CSS variable the way NativeWind's className
// pipeline can.
const AVATAR_COLORS = [
  '#FBBF24', // primary-400
  '#7EC75D', // green-400
  '#51B6CF', // blue-400
  '#FBAB33', // yellow-400
  '#EC5D5D', // red-400
  '#B8B4A5', // neutral-400
  '#B45309', // primary-700
  '#075985', // blue-700
];

const AVATAR_EMOJIS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🤩',
  '🥳',
  '😎',
  '🤓',
  '🧐',
  '😴',
  '🤔',
  '🙃',
  '😇',
  '🥰',
  '😜',
  '🤗',
  '🤠',
  '👻',
  '🐱',
  '🐶',
  '🦊',
  '🐼',
  '🦁',
  '🐸',
  '🦄',
  '🌟',
  '⚡️',
  '🔥',
];

export type ThemedAvatarPickerModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  currentBackgroundColor?: string | null;
  currentEmoji?: string | null;
  onSaved: (avatar: { backgroundColor: string; emoji: string }) => void;
};

const ThemedAvatarPickerModal = (props: ThemedAvatarPickerModalProps) => {
  const [color, setColor] = useState(
    props.currentBackgroundColor ?? AVATAR_COLORS[0]!,
  );
  const [emoji, setEmoji] = useState(props.currentEmoji ?? AVATAR_EMOJIS[0]!);
  const [saving, setSaving] = useState(false);

  const onFinishPressed = async () => {
    setSaving(true);
    try {
      await api.updateMyAvatar({ backgroundColor: color, emoji });
      props.onSaved({ backgroundColor: color, emoji });
      props.onRequestClose();
    } catch (error) {
      console.error('failed to save avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedModal visible={props.visible} onRequestClose={props.onRequestClose}>
      <View className="items-center pt-[20px] pb-[30px]">
        <Avatar
          size="extra-large"
          backgroundColor={color}
          emoji={emoji}
          showBorder={false}
        ></Avatar>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text
          className="px-[15px] pb-[10px] text-neutral-600"
          variant="caption"
        >
          Hintergrundfarbe
        </Text>
        <View className="flex-row flex-wrap gap-[10px] px-[15px]">
          {AVATAR_COLORS.map((option) => (
            <ThemedSelectable
              key={option}
              selected={option === color}
              onPress={() => setColor(option)}
            >
              <View
                style={{
                  height: 44,
                  width: 44,
                  borderRadius: 22,
                  backgroundColor: option,
                }}
              ></View>
            </ThemedSelectable>
          ))}
        </View>

        <Text
          className="px-[15px] pb-[10px] pt-[20px] text-neutral-600"
          variant="caption"
        >
          Emoji
        </Text>
        <View className="flex-row flex-wrap gap-[10px] px-[15px]">
          {AVATAR_EMOJIS.map((option) => (
            <ThemedSelectable
              key={option}
              selected={option === emoji}
              onPress={() => setEmoji(option)}
            >
              <View
                className="bg-neutral-100 items-center justify-center"
                style={{ height: 44, width: 44, borderRadius: 22 }}
              >
                <Text style={{ fontSize: 22 }}>{option}</Text>
              </View>
            </ThemedSelectable>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-[30px] left-[15px] right-[15px]">
        <Button
          variant="primary"
          size="lg"
          disabled={saving}
          onPress={onFinishPressed}
        >
          <Text>Fertig</Text>
          <Icon name="check" size={24} />
        </Button>
      </View>
    </ThemedModal>
  );
};

export default ThemedAvatarPickerModal;
