import APPLICATION_CONSTANTS from '@/constants/strings';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export type ProfilePageInputFieldData = {
  id: number;
  description: string;
  value?: string;
  isEditable?: boolean;
};

const ProfileEditPage = () => {
  const inputData: ProfilePageInputFieldData[] = [
    {
      id: 1,
      description: 'Name',
      value: 'Mad Max',
    },
    {
      id: 2,
      description: 'Benutzername',
      value: '@mmax',
    },
    {
      id: 3,
      description: 'Schule',
      value: 'Rotteck-Gymnasium Freiburg',
      isEditable: false,
    },
    {
      id: 4,
      description: 'Klasse',
      value: '9d',
    },
    {
      id: 5,
      description: 'Geburtsdatum',
      value: '16.06.2006',
    },
  ];

  const neutral900Color = useThemeColor({}, 'neutral-900');

  const [values, setValues] = useState<Record<string, string>>({
    '1': inputData[0].value ?? '',
    '2': inputData[1].value ?? '',
    '3': inputData[2].value ?? '',
    '4': inputData[3].value ?? '',
    '5': inputData[4].value ?? '',
  });

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = () => {
    router.replace('/(locked)/(tabs)/chats');
  };

  const handleChange = (id: number, newValue: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  return (
    <View className="flex-1">
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
      <ScrollView className="gap-[20px] px-[15px]">
        <View className="mt-[150px] gap-[40px] mb-[50px]">
          <View className="w-full items-center gap-[10px]">
            <Text className="w-[80%] text-center" variant="heading2">
              {APPLICATION_CONSTANTS.PROFILE_EDIT_PAGE_HEADING}
            </Text>
            <Text className="w-[80%] text-center" variant="body">
              {APPLICATION_CONSTANTS.PROFILE_EDIT_PAGE_SUBHEADING}
            </Text>
          </View>
          <View className="w-full justify-center flex-row gap-[30px] items-center">
            <Avatar size={'large'}></Avatar>
            <View className="w-[2px] h-[80px] bg-neutral-400"></View>
            <Icon name="sparkle" size={70} color={neutral900Color}></Icon>
          </View>
        </View>
        {inputData.map((inputField) => (
          <View key={inputField.id} className="pb-[10px]">
            <Input
              key={inputField.id}
              placeholder={inputField.value ?? 'Hinzufügen'}
              fieldDescription={inputField.description}
              value={values[inputField.id] ?? ''}
              isEditable={inputField.isEditable}
              heightBased={65}
              onChangeText={(input) => handleChange(inputField.id, input)}
            ></Input>
          </View>
        ))}
        <View className="h-[200px]"></View>
      </ScrollView>
      <SafeAreaView className="absolute left-0 right-0 px-[15px] bottom-[20px]">
        <Button variant="primary" size="lg" onPress={handleContinueButtonPress}>
          <Text>{APPLICATION_CONSTANTS.GENERAL_NEXT_PAGE}</Text>
          <Icon name="arrow-right" size={24} />
        </Button>
      </SafeAreaView>
    </View>
  );
};

export default ProfileEditPage;
