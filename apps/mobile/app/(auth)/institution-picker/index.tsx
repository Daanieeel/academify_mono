import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registryClient } from '@/lib/registry';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

type Institution = NonNullable<
  Awaited<ReturnType<typeof registryClient.institutions.get>>['data']
>['institutions'][0];

export default function InstitutionPicker() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);

  const {
    data: institutions = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['institutions', debouncedQuery],
    queryFn: async () => {
      const { data, error } = await registryClient.institutions.get({
        $query: { search: debouncedQuery || undefined },
      });
      if (error) {throw error;}
      return data?.institutions ?? [];
    },
  });

  const error = isError ? 'Failed to load institutions' : null;

  const handleSelect = (inst: Institution) => {
    // Navigate immediately to remove lag
    router.push({
      pathname: '/(auth)/username-page',
      params: {
        institutionId: inst.slug,
        institutionName: inst.display_name,
      },
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: Institution }) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        className="flex-row items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-3 shadow-sm border border-[#4a3b32] dark:border-[#5a4b42]"
      >
        <View className="flex-1 pr-4">
          <Text className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
            {item.display_name}
          </Text>
          <Text className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
            {item.type ? `${item.type} • ` : ''}
            {item.region || item.country || ''}
          </Text>
        </View>
        <Icon name="caret-right" size={20} className="text-neutral-400" />
      </TouchableOpacity>
    ),
    [],
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Schule finden',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />
      <View className="flex-1 p-4 pt-2">
        <Text className="text-sm text-neutral-500 mb-4">
          Bitte gib den Namen deiner Schule oder Einrichtung ein.
        </Text>

        <View className="mb-4 relative justify-center">
          <View className="absolute left-4 z-10">
            <Icon
              name="magnifying-glass"
              size={20}
              className="text-neutral-400"
            />
          </View>
          <TextInput
            className="w-full bg-white dark:bg-neutral-800 rounded-xl px-12 py-3.5 text-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            placeholder="Schule suchen..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              className="absolute right-4 z-10"
              onPress={() => setQuery('')}
            >
              <Icon name="x-circle" size={20} className="text-neutral-400" />
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
            <Text className="text-red-500 text-center font-medium">
              {error}
            </Text>
          </View>
        )}

        <FlatList
          data={institutions}
          keyExtractor={(item) => item.slug}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() =>
            !isLoading && query ? (
              <View className="py-8 items-center">
                <Text className="text-neutral-500 text-center">
                  Keine Schule für "{query}" gefunden.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
