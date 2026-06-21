import APPLICATION_CONSTANTS from '@/constants/strings';
import { useSession } from '@/context/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

const UsernamePage = () => {
  const [password, setPassword] = useState('');
  const [inputError, setInputError] = useState('');
  const [isValid, setIsValid] = useState(true);

  const router = useRouter();
  const { signIn } = useSession();
  const errorColor = useThemeColor({}, 'red-500');
  const neutral900Color = useThemeColor({}, 'neutral-900');
  const userId = useLocalSearchParams().id as string;

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleValidatePassword = async () => {
    if (password.length < 1) {
      setIsValid(false);
      setInputError('Du hast nichts in das Feld eingegeben');
      return;
    }

    const { error } = await signIn(userId, password);
    if (error) {
      setIsValid(false);
      setInputError(error);
      return;
    }

    setIsValid(true);
    router.push(`/(auth)/user-card-page/${userId}`);
  };

  const handleInputChange = (input: string) => {
    setPassword(input);
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
      <View className="pt-[70px] px-[15px] w-full gap-[30px]">
        <View className="gap-[10px] items-center">
          <Icon size={62} name="password" color={neutral900Color}></Icon>
          <Text
            color={neutral900Color}
            variant="heading2"
            className="text-center"
          >
            {APPLICATION_CONSTANTS.PASSWORD_PAGE_HEADING}
          </Text>
          <Text color={neutral900Color} variant="body" className="text-center">
            {APPLICATION_CONSTANTS.PASSWORD_PAGE_SUBHEADING +
              ' ' +
              userId +
              '?'}
          </Text>
        </View>
        <View className="gap-[5px]">
          <Input
            placeholder={APPLICATION_CONSTANTS.PASSWORD_PAGE_INPUT_PLACEHOLDER}
            value={password}
            onChangeText={handleInputChange}
            obscureText={true}
            heightBased={60}
          ></Input>
          {!isValid && (
            <View className="mt-[10px] flex-row gap-[5px] items-center">
              <Icon name="x-circle" size={15} color={errorColor}></Icon>
              <Text color={errorColor} variant="caption">
                {inputError}
              </Text>
            </View>
          )}
        </View>
        <View className="gap-[10px]">
          <Button variant="primary" size="lg" onPress={handleValidatePassword}>
            <Text>Weiter</Text>
            <Icon name="arrow-right" size={24} />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onPress={handleValidatePassword}
          >
            <Text>Passwort vergessen?</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UsernamePage;
