// The footer for the chat page including a textfield and buttons for attachments as well as the send button

import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SmallButton from '@/components/buttons/small-button';
import ThemedRoundButton from '@/components/buttons/themed-round-button';
import IcomoonIcon from '@/components/IcomoonIcon';
import ThemedPressable from '@/components/themed-pressable';
import ThemedTextField from '@/components/themed-text-field';

const ATTACHMENT_BUTTON_HEIGHT = 280;

export type ThemedChatPageFooterProps = {
  currentDisplay: 'keyboard' | 'attachments' | 'none';
  setCurrentDisplay: (display: 'keyboard' | 'attachments' | 'none') => void;
};

const ThemedChatPageFooter = ({
  currentDisplay,
  setCurrentDisplay,
}: ThemedChatPageFooterProps) => {
  const neutral50Color = useThemeColor({}, 'neutral-50');
  const neutral900Color = useThemeColor({}, 'neutral-900');
  const safeAreaBottom = useSafeAreaInsets().bottom;

  const inputRef = useRef(null);

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
      inputRef.current.blur();
    } else if (currentDisplay === 'attachments') {
      setCurrentDisplay('keyboard');
      inputRef.current.focus();
    } else if (currentDisplay === 'none') {
      setCurrentDisplay('attachments');
    }
  };

  const animatedPaddingStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: bottomPadding.value,
    };
  });

  const sendButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: 0.7 + 0.3 * showSend.value }],
      opacity: showSend.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles['main-container'],
        animatedPaddingStyle,
        {
          backgroundColor: neutral50Color,
          borderColor: neutral900Color,
        },
      ]}
    >
      {/* View for the plus button, textfield and send button */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {/* Plus Button to show attachments */}

        <ThemedPressable
          feedBackType="medium"
          style={{
            paddingRight: 15,
          }}
          onPress={onShowAttachmentButtonsPressed}
        >
          <IcomoonIcon
            name={currentDisplay === 'attachments' ? 'keyboard' : 'plus'}
            size={25}
          ></IcomoonIcon>
        </ThemedPressable>

        {/* Actual input field */}

        <View
          style={{
            flex: 1,
          }}
        >
          <ThemedTextField
            onPress={onTextFieldPress}
            ref={inputRef}
            multiline
            numberOfLines={3}
            onChangeText={setInput}
            value={input}
            placeholder="Nachricht eingeben"
          ></ThemedTextField>
        </View>

        {/* Send button when text field is not empty*/}

        {input !== '' ? (
          <Animated.View
            style={[
              sendButtonStyle,
              {
                paddingLeft: 15,
              },
            ]}
          >
            <SmallButton
              onPress={() => {}}
              iconName="paper-plane-right"
              type="inverted"
              iconSize={22}
            ></SmallButton>
          </Animated.View>
        ) : undefined}
      </View>

      {/* Attachment buttons */}

      {currentDisplay === 'attachments' ? (
        <View
          style={{
            position: 'absolute',
            right: 0,
            left: 0,
            bottom: 0,
            height: ATTACHMENT_BUTTON_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: '80%',
              justifyContent: 'space-between',
              flexDirection: 'row',
              gap: 30,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <ThemedRoundButton
              label={'Bild'}
              icomoonIcon={'image'}
              onPress={() => {}}
            />
            <ThemedRoundButton
              label={'Bild'}
              icomoonIcon={'image'}
              onPress={() => {}}
            />
            <ThemedRoundButton
              label={'Kamera'}
              icomoonIcon={'camera'}
              onPress={() => {}}
            />
            <ThemedRoundButton
              label={'Kamera'}
              icomoonIcon={'camera'}
              onPress={() => {}}
            />
            <ThemedRoundButton
              label={'Umfrage'}
              icomoonIcon={'poll'}
              onPress={() => {}}
            />
            <ThemedRoundButton
              label={'Bild'}
              icomoonIcon={'image'}
              onPress={() => {}}
            />
          </View>
        </View>
      ) : undefined}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  'main-container': {
    paddingHorizontal: 15,
    zIndex: 9999,
    borderTopWidth: 1.5,
    paddingTop: 10,
    flexDirection: 'column',
    gap: 10,
  },
});

export default ThemedChatPageFooter;
