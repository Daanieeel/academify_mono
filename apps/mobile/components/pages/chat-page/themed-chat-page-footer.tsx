import { Input } from '@/components/ui/input';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// The footer for the chat page including a textfield and buttons for attachments as well as the send button

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';

import { Button } from '@/components/ui/button';
import { RoundButton } from '@/components/ui/round-button';
import ThemedPressable from '@/components/themed-pressable';

const ATTACHMENT_BUTTON_HEIGHT = 280;

export type ThemedChatPageFooterProps = {
  currentDisplay: 'keyboard' | 'attachments' | 'none';
  setCurrentDisplay: (display: 'keyboard' | 'attachments' | 'none') => void;
  onSend?: (text: string) => void;
};

const ThemedChatPageFooter = ({
  currentDisplay,
  setCurrentDisplay,
  onSend,
}: ThemedChatPageFooterProps) => {
  const safeAreaBottom = useSafeAreaInsets().bottom;

  const inputRef = useRef<TextInput>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const additionalPadding = safeAreaBottom === 0 ? 10 : 0;

  const showSend = useSharedValue(0);
  const bottomPadding = useSharedValue(additionalPadding + safeAreaBottom);

  // Gets updated based on whether the keyboard is shown
  // When the safe area is 0, a small padding is added

  const [input, setInput] = useState('');

  const changeBottomPadding = useCallback(
    (padding: number, duration?: number) => {
      bottomPadding.value = withTiming(padding, {
        duration: duration ?? 150,
        easing: Easing.linear,
      });
    },
    [bottomPadding],
  );

  useEffect(() => {
    showSend.value = withSpring(input !== '' ? 1 : 0, { duration: 200 });
  }, [input, showSend]);

  useEffect(() => {
    console.log('current display changed to', currentDisplay);
    switch (currentDisplay) {
      case 'keyboard':
        changeBottomPadding(keyboardHeight + 10);
        break;
      case 'attachments':
        changeBottomPadding(ATTACHMENT_BUTTON_HEIGHT);
        break;
      case 'none':
        inputRef.current?.blur();
        changeBottomPadding(additionalPadding + safeAreaBottom);
        break;
    }
  }, [
    additionalPadding,
    changeBottomPadding,
    currentDisplay,
    keyboardHeight,
    safeAreaBottom,
  ]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {});
    return () => {
      hideSub.remove();
      showSub.remove();
    };
  }, []);

  const onTextFieldPress = () => {
    setCurrentDisplay('keyboard');
  };

  const onShowAttachmentButtonsPressed = () => {
    if (currentDisplay === 'keyboard') {
      setCurrentDisplay('attachments');
      inputRef.current?.blur();
    } else if (currentDisplay === 'attachments') {
      setCurrentDisplay('keyboard');
      inputRef.current?.focus();
    } else if (currentDisplay === 'none') {
      setCurrentDisplay('attachments');
    }
  };

  const animatedBottomSpacerStyle = useAnimatedStyle(() => {
    return {
      height: bottomPadding.value,
    };
  });

  const sendButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 0.7 + 0.3 * showSend.value }],
      opacity: showSend.value,
    };
  });

  return (
    <View className="px-[15px] z-[9999] pt-[10px] flex-col gap-[10px] bg-transparent">
      <BlurView
        intensity={50}
        tint="light"
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(250, 250, 245, 0)', 'rgba(250, 250, 245, 1)']}
        style={StyleSheet.absoluteFillObject}
      />
      {/* View for the plus button, textfield and send button */}

      <View className="flex-row items-center">
        {/* Plus Button to show attachments */}

        <ThemedPressable
          feedBackType="medium"
          className="pr-[15px]"
          onPress={onShowAttachmentButtonsPressed}
        >
          <Icon
            name={currentDisplay === 'attachments' ? 'keyboard' : 'plus'}
            size={25}
          ></Icon>
        </ThemedPressable>

        {/* Actual input field */}

        <View className="flex-1">
          <Input
            onPress={onTextFieldPress}
            ref={inputRef}
            multiline
            numberOfLines={3}
            onChangeText={setInput}
            value={input}
            placeholder="Nachricht eingeben"
          ></Input>
        </View>

        {/* Send button when text field is not empty*/}

        {input !== '' ? (
          <View className="pl-[15px]">
            <Animated.View style={sendButtonStyle}>
              <Button
                variant="inverted"
                onPress={() => {
                  const text = input.trim();
                  if (text === '') {
                    return;
                  }
                  setInput('');
                  onSend?.(text);
                }}
              >
                <Icon name="paper-plane-right" size={22} />
              </Button>
            </Animated.View>
          </View>
        ) : undefined}
      </View>

      {/* Attachment buttons */}

      {currentDisplay === 'attachments' ? (
        <View
          className="absolute right-0 left-0 bottom-0 items-center justify-center"
          style={{ height: ATTACHMENT_BUTTON_HEIGHT }}
        >
          <View className="w-[80%] justify-between flex-row gap-[30px] items-center flex-wrap">
            <RoundButton
              label={'Bild'}
              icomoonIcon={'image'}
              onPress={() => {}}
            />
            <RoundButton
              label={'Bild'}
              icomoonIcon={'image'}
              onPress={() => {}}
            />
            <RoundButton
              label={'Kamera'}
              icomoonIcon={'camera'}
              onPress={() => {}}
            />
            <RoundButton
              label={'Kamera'}
              icomoonIcon={'camera'}
              onPress={() => {}}
            />
            <RoundButton
              label={'Umfrage'}
              icomoonIcon={'poll'}
              onPress={() => {}}
            />
            <RoundButton
              label={'Bild'}
              icomoonIcon={'image'}
              onPress={() => {}}
            />
          </View>
        </View>
      ) : undefined}

      {/* Spacer that grows with the keyboard/safe-area inset */}
      <Animated.View style={animatedBottomSpacerStyle} />
    </View>
  );
};

export default ThemedChatPageFooter;
