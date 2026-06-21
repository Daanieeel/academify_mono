import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

const UsernamePage = () => {
  const [text, setText] = useState('');
  const [inputError, setInputError] = useState('');
  const [isValid, setIsValid] = useState(true);

  const router = useRouter();
  const errorColor = useThemeColor({}, 'red-500');
  const neutral900Color = useThemeColor({}, 'neutral-900');

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = (input: string) => {
    if (input.length < 1) {
      setIsValid(false);
      setInputError('Du hast nichts in das Feld eingegeben');
      return false;
    } else {
      router.push(`/(auth)/password-page/${text}`);
    }
  };

  const handleInputChange = (input: string) => {
    if (input.includes(' ')) {
      const withoutSpaces = input.replace(/\s/g, '');
      setText(withoutSpaces);
    } else {
      setText(input);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <Button onPress={handleBackButtonPress}>
              <Icon name="arrow-left" />
              <Text>Zurück</Text>
            </Button>
          ),
        }}
      ></Stack.Screen>
      <View className="pt-[70px] px-[15px] w-full gap-[20px]">
        <View className="gap-[10px] items-center">
          <Icon size={62} name="user-focus" color={neutral900Color}></Icon>
          <Text
            color={neutral900Color}
            variant="heading2"
            className="text-center"
          >
            Wer bist du?
          </Text>
          <Text color={neutral900Color} variant="body" className="text-center">
            Benutzernamen oder Mail eingeben
          </Text>
        </View>
        <Input
          placeholder="Benutzername oder E-Mail"
          value={text}
          onChangeText={handleInputChange}
          heightBased={60}
          autoCorrect={false}
          spellCheck={false}
        ></Input>
        {!isValid && (
          <View className="mt-[10px] flex-row gap-[5px] items-center">
            <Icon name="x-circle" size={15} color={errorColor}></Icon>
            <Text color={errorColor} variant="caption">
              {inputError}
            </Text>
          </View>
        )}
        <Button
          variant="primary"
          size="lg"
          onPress={() => handleContinueButtonPress(text)}
        >
          <Text>Weiter</Text>
          <Icon name="arrow-right" size={24} />
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default UsernamePage;
