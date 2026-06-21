import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api-client';
import {
  isEmojiAllowed,
  parseAvatarGradient,
  serializeAvatarGradient,
} from '@/lib/avatar';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Keyboard, ScrollView, TextInput, View } from 'react-native';
import ThemedModal from './themed-modal';
import ThemedSelectable from './themed-picker-modal/themed-selectable';

type Gradient = [string, string];

// All gradient pairs, not flat colors. The first handful (with emoji) are the
// inline quick-pick combos; the full list is what the "Farbe" button reveals.
const AVATAR_GRADIENTS: Gradient[] = [
  ['#FDE68A', '#F59E0B'],
  ['#89CCDD', '#0369A1'],
  ['#A6D78D', '#3C7123'],
  ['#F58C8C', '#B91C1C'],
  ['#FCD34D', '#B45309'],
  ['#51B6CF', '#075985'],
  ['#C8E6B9', '#4B8E2B'],
  ['#DAF0F4', '#0EA5E9'],
  ['#FDE68A', '#EC5D5D'],
  ['#A6D78D', '#0EA5E9'],
  ['#FCD34D', '#DC2626'],
  ['#FBBF24', '#7C2D12'],
  ['#7EC75D', '#223B14'],
  ['#FAB8B8', '#7F1D1D'],
  ['#FEC566', '#9A3412'],
  ['#FDE68A', '#5BAB34'],
  ['#89CCDD', '#2E541B'],
  ['#FBAB33', '#0C4A6E'],
  ['#EC5D5D', '#78350F'],
  ['#0EA5E9', '#27231C'],
  ['#5BAB34', '#0369A1'],
  ['#FCD34D', '#0EA5E9'],
  ['#B8B4A5', '#575246'],
  ['#FEC566', '#B91C1C'],
];

export const AVATAR_PRESETS: { gradient: Gradient; emoji: string }[] = [
  { gradient: ['#FDE68A', '#F59E0B'], emoji: '😀' },
  { gradient: ['#89CCDD', '#0369A1'], emoji: '🐼' },
  { gradient: ['#A6D78D', '#3C7123'], emoji: '🐸' },
  { gradient: ['#F58C8C', '#B91C1C'], emoji: '🦊' },
  { gradient: ['#FCD34D', '#B45309'], emoji: '🦄' },
  { gradient: ['#51B6CF', '#075985'], emoji: '🌟' },
];

function gradientsEqual(a: Gradient, b: Gradient): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

export type ThemedAvatarPickerModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  currentBackgroundColor?: string | null;
  currentEmoji?: string | null;
  onSaved: (avatar: { backgroundColor: string; emoji: string }) => void;
  /** When false, picked avatar is only handed to `onSaved` — no profile API call. Used for things like group avatars that aren't the caller's own account. */
  persist?: boolean;
};

const ThemedAvatarPickerModal = (props: ThemedAvatarPickerModalProps) => {
  const { persist = true } = props;
  const [gradient, setGradient] = useState<Gradient>(
    parseAvatarGradient(props.currentBackgroundColor) ?? AVATAR_GRADIENTS[0]!,
  );
  const [emoji, setEmoji] = useState(
    props.currentEmoji ?? AVATAR_PRESETS[0]!.emoji,
  );
  const [showAllColors, setShowAllColors] = useState(false);
  const [emojiError, setEmojiError] = useState(false);
  const [saving, setSaving] = useState(false);
  const emojiInputRef = useRef<TextInput>(null);

  const onEmojiButtonPressed = () => {
    setEmojiError(false);
    emojiInputRef.current?.focus();
  };

  const onEmojiTyped = (text: string) => {
    const picked = text.trim();
    if (!picked) {
      return;
    }
    if (!isEmojiAllowed(picked)) {
      setEmojiError(true);
      return;
    }
    setEmoji(picked);
    setEmojiError(false);
    Keyboard.dismiss();
  };

  const onFinishPressed = async () => {
    const backgroundColor = serializeAvatarGradient(gradient);
    if (!persist) {
      props.onSaved({ backgroundColor, emoji });
      props.onRequestClose();
      return;
    }
    setSaving(true);
    try {
      await api.updateMyAvatar({ backgroundColor, emoji });
      props.onSaved({ backgroundColor, emoji });
      props.onRequestClose();
    } catch (error) {
      console.error('failed to save avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  const backgroundColor = serializeAvatarGradient(gradient);

  return (
    <ThemedModal visible={props.visible} onRequestClose={props.onRequestClose}>
      <View className="items-center pt-[20px] pb-[20px]">
        <Avatar
          size="extra-large"
          backgroundColor={backgroundColor}
          emoji={emoji}
          showBorder={false}
        ></Avatar>
      </View>

      {/* Hidden field — focusing it opens the system emoji keyboard, the only
          way to reach the full OS emoji set without a bundled picker lib. */}
      <TextInput
        ref={emojiInputRef}
        value=""
        onChangeText={onEmojiTyped}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text
          className="px-[15px] pb-[10px] text-neutral-600"
          variant="caption"
        >
          Vorschläge
        </Text>
        <View className="flex-row flex-wrap gap-[10px] px-[15px]">
          {AVATAR_PRESETS.map((preset) => (
            <ThemedSelectable
              key={`${preset.gradient[0]}-${preset.emoji}`}
              selected={
                gradientsEqual(preset.gradient, gradient) &&
                preset.emoji === emoji
              }
              onPress={() => {
                setGradient(preset.gradient);
                setEmoji(preset.emoji);
              }}
            >
              <LinearGradient
                colors={preset.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: 56,
                  width: 56,
                  borderRadius: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 28 }}>{preset.emoji}</Text>
              </LinearGradient>
            </ThemedSelectable>
          ))}
        </View>

        <View className="flex-row gap-[10px] px-[15px] pt-[20px]">
          <View className="flex-1">
            <Button variant="normal" onPress={onEmojiButtonPressed}>
              <Icon name="smiley" size={18} />
              <Text>Emoji</Text>
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="normal"
              onPress={() => setShowAllColors((prev) => !prev)}
            >
              <Icon name="palette" size={18} />
              <Text>Farbe</Text>
            </Button>
          </View>
        </View>

        {emojiError && (
          <Text className="px-[15px] pt-[10px] text-red-600" variant="caption">
            Dieses Emoji ist nicht erlaubt.
          </Text>
        )}

        {showAllColors && (
          <>
            <Text
              className="px-[15px] pb-[10px] pt-[20px] text-neutral-600"
              variant="caption"
            >
              Farbverlauf
            </Text>
            <View className="flex-row flex-wrap gap-[10px] px-[15px]">
              {AVATAR_GRADIENTS.map((option) => (
                <ThemedSelectable
                  key={`${option[0]}-${option[1]}`}
                  selected={gradientsEqual(option, gradient)}
                  onPress={() => setGradient(option)}
                >
                  <LinearGradient
                    colors={option}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ height: 48, width: 48, borderRadius: 24 }}
                  ></LinearGradient>
                </ThemedSelectable>
              ))}
            </View>
          </>
        )}
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
