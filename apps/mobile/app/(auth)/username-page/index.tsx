import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

import { useSession } from '@/context/auth-context';
import { useInstitution } from '@/context/institution-context';
import { setInstitutionId } from '@/lib/api-client';

const UsernamePage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inputError, setInputError] = useState('');
  const [isValid, setIsValid] = useState(true);

  const router = useRouter();
  const { signIn } = useSession();
  const { setActiveInstitutionId } = useInstitution();
  const errorColor = useThemeColor({}, 'red-500');
  const neutral900Color = useThemeColor({}, 'neutral-900');

  const params = useLocalSearchParams();
  const { institutionId } = params;

  React.useEffect(() => {
    if (typeof institutionId === 'string') {
      setInstitutionId(institutionId);
    }
  }, [institutionId]);

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = async () => {
    if (username.length < 1 || password.length < 1) {
      setIsValid(false);
      setInputError('Bitte gib Benutzernamen und Passwort ein.');
      return;
    }

    const { error, session } = await signIn(username, password);
    if (error) {
      setIsValid(false);
      setInputError(error);
      return;
    }

    if (session?.mainInstitutionId) {
      await setActiveInstitutionId(session.mainInstitutionId);
    } else {
      // Fallback if no mainInstitutionId
      await setActiveInstitutionId(null);
    }

    setIsValid(true);
    router.push(`/(auth)/user-card-page/${username}`);
  };

  const handleUntisLoginButtonPress = () => {
    // Implement Untis login here using backendUrl
  };

  const handleUsernameChange = (input: string) => {
    if (input.includes(' ')) {
      const withoutSpaces = input.replace(/\s/g, '');
      setUsername(withoutSpaces);
    } else {
      setUsername(input);
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
          <Text color={neutral900Color} variant="h2" className="text-center">
            Anmelden
          </Text>
          <Text color={neutral900Color} variant="body" className="text-center">
            Logge dich in deinen Account ein
          </Text>
        </View>

        <Input
          placeholder="Benutzername oder E-Mail"
          value={username}
          onChangeText={handleUsernameChange}
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize="none"
        ></Input>

        <Input
          placeholder="Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        ></Input>

        {!isValid && (
          <View className="mt-[10px] flex-row gap-[5px] items-center pr-[15px]">
            <Icon name="warning-circle" size={15} color={errorColor}></Icon>
            <Text color={errorColor} variant="caption" className="flex-1">
              {inputError}
            </Text>
          </View>
        )}

        <Button variant="default" size="lg" onPress={handleContinueButtonPress}>
          <Text>Anmelden</Text>
          <Icon name="arrow-right" size={24} />
        </Button>

        <View className="flex-row items-center my-[15px]">
          <View className="flex-1 h-[1px] bg-neutral-200" />
          <Text className="mx-4 text-neutral-500 font-medium text-sm">
            ODER
          </Text>
          <View className="flex-1 h-[1px] bg-neutral-200" />
        </View>

        <Button
          variant="secondary"
          size="lg"
          onPress={handleUntisLoginButtonPress}
        >
          <Image
            className="h-[26px] w-[26px]"
            source={require('@/assets/images/app/untis-3x.png')}
          />
          <Text color={useThemeColor({}, 'untis-orange')}>
            Mit Untis anmelden
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default UsernamePage;
