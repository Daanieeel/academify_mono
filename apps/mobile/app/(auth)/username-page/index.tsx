import { useThemeColor } from '@/hooks/use-theme-color';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Field, FieldError } from '@/components/ui/field';
import { useForm } from '@tanstack/react-form';
import * as z from 'zod';

import { useSession } from '@/context/auth-context';
import { useInstitution } from '@/context/institution-context';
import { setInstitutionId } from '@/lib/api-client';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Benutzername darf nicht leer sein.')
    .refine(
      (v) => !/\s/.test(v),
      'Benutzername darf keine Leerzeichen enthalten.',
    ),
  password: z.string().min(1, 'Passwort darf nicht leer sein.'),
});

const UsernamePage = () => {
  const router = useRouter();
  const { signIn } = useSession();
  const { setActiveInstitutionId } = useInstitution();
  const neutral900Color = useThemeColor({}, 'neutral-900');

  const params = useLocalSearchParams();
  const { institutionId } = params;

  React.useEffect(() => {
    if (typeof institutionId === 'string') {
      setInstitutionId(institutionId);
    }
  }, [institutionId]);

  const form = useForm({
    defaultValues: { username: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      const { error, session } = await signIn(value.username, value.password);

      if (error) {
        // Surface server errors on the username field so they appear inline
        form.setFieldMeta('username', (prev) => ({
          ...prev,
          errors: [error],
          isTouched: true,
          isValid: false,
        }));
        return;
      }

      if (session?.mainInstitutionId) {
        await setActiveInstitutionId(session.mainInstitutionId);
      } else {
        await setActiveInstitutionId(null);
      }

      router.push(`/(auth)/user-card-page/${value.username}`);
    },
  });

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleUntisLoginButtonPress = () => {
    // Implement Untis login here using backendUrl
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleBackButtonPress}
              className="flex-row items-center gap-2 px-2 py-1"
            >
              <Icon name="arrow-left" size={24} className="text-foreground" />
            </TouchableOpacity>
          ),
        }}
      ></Stack.Screen>
      <View className="pt-[70px] px-[15px] w-full gap-[20px]">
        <View className="gap-[10px] items-center mb-12">
          <Icon size={62} name="user-focus" color={neutral900Color}></Icon>
          <Text color={neutral900Color} variant="h2" className="text-center">
            Anmelden
          </Text>
          <Text color={neutral900Color} variant="body" className="text-center">
            Logge dich in deinen Account ein
          </Text>
        </View>

        <View className="gap-[12px]">
          <form.Field name="username">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <Input
                    placeholder="Benutzername oder E-Mail"
                    value={field.state.value}
                    onChangeText={(v) =>
                      field.handleChange(v.replace(/\s/g, ''))
                    }
                    onBlur={field.handleBlur}
                    autoCorrect={false}
                    spellCheck={false}
                    autoCapitalize="none"
                    error={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="password">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field>
                  <Input
                    placeholder="Passwort"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    error={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        </View>

        <Button
          variant="secondary"
          size="lg"
          onPress={() => form.handleSubmit()}
        >
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

        <Button variant="untis" size="lg" onPress={handleUntisLoginButtonPress}>
          <Image
            style={{ width: 24, height: 24, borderRadius: 4 }}
            source={{
              uri: 'https://www.untis.at/fileadmin/user_upload/Icon-1024x1024.svg',
            }}
            contentFit="contain"
          />
          <Text>Mit Untis anmelden</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default UsernamePage;
