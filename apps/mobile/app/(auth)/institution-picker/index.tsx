import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Card } from '@/components/ui/card';
import ThemedPressable from '@/components/themed-pressable';
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
        <ThemedPressable
          onPress={() => handleSelect(item)}
          className="mb-4"
          innerStyle={{ flexDirection: 'column', alignItems: 'stretch' }}
        >
          <Card className="bg-card">
            {/* Banner */}
            {item.banner_url ? (
              <Image
                source={{ uri: bannerUri }}
                style={{
                  width: '100%',
                  height: 96,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                }}
                contentFit="cover"
              />
            ) : (
              <View
                className="w-full h-24 bg-muted"
                style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
              />
            )}

            {/* Content area */}
            <View className="p-4 pt-10 relative">
              {/* Avatar (overlapping banner) */}
              <View className="absolute -top-10 left-4 bg-card rounded-xl border-2 border-foreground shadow-brutal z-10">
                {item.avatar_url ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 64, height: 64, borderRadius: 10 }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{ width: 64, height: 64, borderRadius: 10 }}
                    className="bg-muted items-center justify-center"
                  >
                    <Icon
                      name="buildings"
                      size={24}
                      className="text-muted-foreground"
                    />
                  </View>
                )}
              </View>

              <View className="flex-row justify-between items-end mt-2">
                <View className="flex-1 pr-4">
                  <Text
                    variant="subheading"
                    className="text-foreground font-martian-extrabold"
                  >
                    {item.display_name}
                  </Text>

                  <View className="flex-row items-center mt-1.5 flex-wrap">
                    {item.type && (
                      <View className="bg-primary px-2 py-0.5 rounded-md mr-2 mb-1 border border-foreground">
                        <Text className="text-xs text-primary-foreground font-martian-extrabold uppercase">
                          {item.type}
                        </Text>
                      </View>
                    )}
                    {(item.region || item.country) && (
                      <Text className="text-xs text-muted-foreground font-martian-bold mb-1">
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
                        className="text-muted-foreground mr-1.5"
                      />
                      <Text
                        className="text-sm text-muted-foreground flex-1 font-martian-bold"
                        numberOfLines={1}
                      >
                        {item.address}
                      </Text>
                    </View>
                  )}
                </View>

                <View className="bg-primary w-8 h-8 rounded-full items-center justify-center mb-1 border-2 border-foreground shadow-brutal">
                  <Icon
                    name="caret-right"
                    size={16}
                    style={{ color: 'hsl(38 50% 96%)' }}
                  />
                </View>
              </View>
            </View>
          </Card>
        </ThemedPressable>
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
          <Input
            placeholder="Schule suchen..."
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={
              <Icon
                name="magnifying-glass"
                size={20}
                className="text-muted-foreground"
              />
            }
          />
          {query.length > 0 && (
            <TouchableOpacity
              className="absolute right-8 z-10"
              onPress={() => setQuery('')}
            >
              <Icon
                name="x-circle"
                size={20}
                className="text-muted-foreground"
              />
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
                size="sm"
                variant={activeFilter === filter.id ? 'default' : 'secondary'}
                onPress={() => setActiveFilter(filter.id)}
                className="rounded-full"
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
