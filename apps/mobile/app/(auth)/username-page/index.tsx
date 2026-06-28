import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

import { resolveInstitution } from '@/lib/registry';

const UsernamePage = () => {
  const params = useLocalSearchParams();
  const [backendUrl, setBackendUrl] = useState(
    (params.backendUrl as string) || '',
  );
  const institutionName = params.institutionName as string;
  const institutionId = params.institutionId as string;

  const [text, setText] = useState('');
  const [inputError, setInputError] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isResolving, setIsResolving] = useState(false);

  const router = useRouter();
  const errorColor = useThemeColor({}, 'red-500');
  const neutral900Color = useThemeColor({}, 'neutral-900');
  const primaryColor = useThemeColor({}, 'primary-500');

  React.useEffect(() => {
    if (!backendUrl && institutionId) {
      setIsResolving(true);
      resolveInstitution(institutionId)
        .then((resolution) => setBackendUrl(resolution.backend_url))
        .catch(console.error)
        .finally(() => setIsResolving(false));
    }
  }, [backendUrl, institutionId]);

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = (input: string) => {
    if (input.length < 1) {
      setIsValid(false);
      setInputError('Du hast nichts in das Feld eingegeben');
      return false;
    } else {
      // In the future, better-auth client will use `backendUrl` here
      router.push(`/(auth)/password-page/${text}`);
    }
  };

  const handleUntisLoginButtonPress = () => {
    // Implement Untis login here using backendUrl
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
