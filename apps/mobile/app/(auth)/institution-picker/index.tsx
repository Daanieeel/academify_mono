import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { registryClient } from '@/lib/registry';
import { getAssetUrl } from '@/lib/utils';
import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

type GetManyRegistryInstitutionsDto = NonNullable<
  Awaited<ReturnType<typeof registryClient.institutions.get>>['data']
>;
type SingleRegistryInstitutionDto =
  GetManyRegistryInstitutionsDto['institutions'][0];

export default function InstitutionPicker() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['institutions', debouncedQuery, activeFilter],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data: queryData, error } = await registryClient.institutions.get({
        $query: {
          ...(debouncedQuery ? { search: debouncedQuery } : {}),
          ...(activeFilter !== 'all' ? { type: activeFilter } : {}),
          offset: pageParam,
          limit: 25,
        },
      });
      if (error) {
        throw error;
      }
      return queryData ?? { institutions: [], has_more: false };
    },
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.has_more) {
        return undefined;
      }
      return allPages.length * 25;
    },
  });

  const institutions = data?.pages.flatMap((page) => page.institutions) ?? [];

  const error = isError ? 'Failed to load institutions' : null;

  const handleSelect = useCallback(
    (inst: SingleRegistryInstitutionDto) => {
      // Navigate immediately to remove lag
      router.push({
        pathname: '/(auth)/username-page',
        params: {
          institutionId: inst.slug,
          institutionName: inst.display_name,
          avatarUrl: inst.avatar_url || '',
        },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: SingleRegistryInstitutionDto }) => {
      const bannerUri = getAssetUrl(item.banner_url)
        ? `${getAssetUrl(item.banner_url)}?t=1`
        : undefined;
      const avatarUri = getAssetUrl(item.avatar_url)
        ? `${getAssetUrl(item.avatar_url)}?t=1`
        : undefined;

      return (
        <TouchableOpacity
          onPress={() => handleSelect(item)}
          className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-4 shadow-sm border border-[#4a3b32]/20 dark:border-[#5a4b42]/30 overflow-hidden"
        >
          {/* Banner */}
          {item.banner_url ? (
            <Image
              source={{ uri: bannerUri }}
              style={{ width: '100%', height: 96 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-full h-24 bg-neutral-200 dark:bg-neutral-700" />
          )}

          {/* Content area */}
          <View className="p-4 pt-10 relative">
            {/* Avatar (overlapping banner) */}
            <View className="absolute -top-10 left-4 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-white dark:border-neutral-900 shadow-sm z-10 overflow-hidden">
              {item.avatar_url ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 64, height: 64 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{ width: 64, height: 64 }}
                  className="bg-neutral-100 dark:bg-neutral-800 items-center justify-center"
                >
                  <Icon
                    name="buildings"
                    size={24}
                    className="text-neutral-400"
                  />
                </View>
              )}
            </View>

            <View className="flex-row justify-between items-end mt-2">
              <View className="flex-1 pr-4">
                <Text className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                  {item.display_name}
                </Text>

                <View className="flex-row items-center mt-1.5 flex-wrap">
                  {item.type && (
                    <View className="bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-md mr-2 mb-1">
                      <Text className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                        {item.type}
                      </Text>
                    </View>
                  )}
                  {(item.region || item.country) && (
                    <Text className="text-xs text-neutral-500 mb-1">
                      {item.region ? `${item.region}, ` : ''}
                      {item.country || ''}
                    </Text>
                  )}
                </View>

                {item.address && (
                  <View className="flex-row items-center mt-2">
                    <Icon
                      name="map-pin"
                      size={14}
                      className="text-neutral-400 mr-1.5"
                    />
                    <Text
                      className="text-sm text-neutral-500 dark:text-neutral-400 flex-1"
                      numberOfLines={1}
                    >
                      {item.address}
                    </Text>
                  </View>
                )}
              </View>

              <View className="bg-neutral-200 dark:bg-neutral-700 w-8 h-8 rounded-full items-center justify-center mb-1">
                <Icon
                  name="caret-right"
                  size={16}
                  className="text-neutral-600 dark:text-neutral-300"
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelect],
  );

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Schule finden',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'transparent' },
        }}
      />

      <View className="flex-1 pt-2">
        <View className="px-4 mb-4 relative justify-center">
          <View className="absolute left-8 z-10">
            <Icon
              name="magnifying-glass"
              size={20}
              className="text-neutral-400"
            />
          </View>
          <TextInput
            className="w-full bg-white dark:bg-neutral-800 rounded-xl pl-12 pr-12 py-3.5 text-lg border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
            placeholder="Schule suchen..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              className="absolute right-8 z-10"
              onPress={() => setQuery('')}
            >
              <Icon name="x-circle" size={20} className="text-neutral-400" />
            </TouchableOpacity>
          )}
        </View>

        <View className="mb-2 bg-neutral-50 dark:bg-neutral-900 z-10">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 10,
              paddingBottom: 10,
            }}
          >
            {[
              { id: 'all', label: 'Alle' },
              { id: 'Gymnasium', label: 'Gymnasium' },
              { id: 'Universität', label: 'Universität' },
              { id: 'Realschule', label: 'Realschule' },
              { id: 'Grundschule', label: 'Grundschule' },
              { id: 'Gesamtschule', label: 'Gesamtschule' },
              { id: 'Berufsschule', label: 'Berufsschule' },
              { id: 'Oberschule', label: 'Oberschule' },
              { id: 'Förderschule', label: 'Förderschule' },
            ].map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'primary' : 'normal'}
                onPress={() => setActiveFilter(filter.id)}
                className="rounded-full px-[15px] py-[8px]"
              >
                <Text
                  className={activeFilter === filter.id ? 'text-white' : ''}
                >
                  {filter.label}
                </Text>
              </Button>
            ))}
          </ScrollView>
        </View>

        {error && (
          <View className="p-4 mx-4 bg-red-50 border border-red-100 rounded-xl mb-4">
            <Text className="text-red-500 text-center font-medium">
              {error}
            </Text>
          </View>
        )}

        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16 }}
          data={institutions}
          keyExtractor={(item) => item.slug}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
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
    </View>
  );
}
