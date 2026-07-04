import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

import { registryClient } from '@/lib/registry';
import { useSession } from '@/context/auth-context';
import { useInstitution } from '@/context/institution-context';
import { api } from '@/lib/api-client';

const UsernamePage = () => {
  const params = useLocalSearchParams();
  const [backendUrl, setBackendUrl] = useState(
    (params.backendUrl as string) || '',
  );
  const institutionName = params.institutionName as string;
  const institutionId = params.institutionId as string;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inputError, setInputError] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isResolving, setIsResolving] = useState(false);

  const router = useRouter();
  const { signIn, signOut } = useSession();
  const { setActiveInstitutionId } = useInstitution();
  const errorColor = useThemeColor({}, 'red-500');
  const neutral900Color = useThemeColor({}, 'neutral-900');

  React.useEffect(() => {
    if (!backendUrl && institutionId) {
      setIsResolving(true);
      registryClient.institutions[institutionId].resolve
        .get()
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }
          if (data && 'backend_url' in data) {
            setBackendUrl((data as any).backend_url);
          }
        })
        .catch(console.error)
        .finally(() => setIsResolving(false));
    }
  }, [backendUrl, institutionId]);

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = async () => {
    if (username.length < 1 || password.length < 1) {
      setIsValid(false);
      setInputError('Bitte gib Benutzernamen und Passwort ein.');
      return;
    }

    const { error } = await signIn(username, password);
    if (error) {
      setIsValid(false);
      setInputError(error);
      return;
    }

    await setActiveInstitutionId(institutionId);

    // Verify membership
    const { error: profileError } = await api.me.get();
    if (profileError) {
      await signOut();
      await setActiveInstitutionId(null);
      setIsValid(false);
      setInputError('Du bist kein Mitglied dieser Schule.');
      return;
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
        {institutionName && (
          <View className="items-center mb-[10px]">
            <View className="px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200">
              <Text className="text-blue-600 font-bold text-xs uppercase tracking-widest">
                {institutionName}
              </Text>
            </View>
          </View>
        )}

        <View className="gap-[10px] items-center">
          <Icon size={62} name="user-focus" color={neutral900Color}></Icon>
          <Text
            color={neutral900Color}
            variant="heading2"
            className="text-center"
          >
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
          heightBased={60}
          autoCorrect={false}
          spellCheck={false}
          autoCapitalize="none"
        ></Input>

        <Input
          placeholder="Passwort"
          value={password}
          onChangeText={setPassword}
          heightBased={60}
          obscureText={true}
          autoCapitalize="none"
        ></Input>

        {!isValid && (
          <View className="mt-[10px] flex-row gap-[5px] items-center">
            <Icon name="x-circle" size={15} color={errorColor}></Icon>
            <Text color={errorColor} variant="caption">
              {inputError}
            </Text>
          </View>
        )}

        <Button variant="primary" size="lg" onPress={handleContinueButtonPress}>
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
