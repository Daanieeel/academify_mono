import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  searchInstitutions,
  resolveInstitution,
  type Institution,
} from '@/lib/registry';

const InstitutionPicker = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const results = await searchInstitutions(query);
        setInstitutions(results);
      } catch (err) {
        setError('Failed to load institutions');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (inst: Institution) => {
    setIsLoading(true);
    setError(null);
    try {
      const resolution = await resolveInstitution(inst.slug);

      // Navigate to username page after success
      router.push({
        pathname: '/(auth)/username-page',
        params: {
          backendUrl: resolution.backend_url,
          institutionId: resolution.slug,
          institutionName: inst.display_name,
        },
      });
    } catch (err) {
      setError('Could not connect to this institution.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Institution }) => (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        className="flex-row items-center justify-between p-4 bg-white dark:bg-neutral-800 rounded-xl mb-3 shadow-sm border border-neutral-100 dark:border-neutral-700"
      >
        <View className="flex-1 pr-4">
          <Text className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
            {item.display_name}
          </Text>
          {item.region && (
            <Text className="text-xs text-neutral-500 uppercase tracking-wider mt-1">
              {item.region}
            </Text>
          )}
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

        <View className="relative mb-6">
          <View className="absolute left-4 top-4 z-10">
            <Icon
              name="magnifying-glass"
              size={20}
              className="text-neutral-400"
            />
          </View>
          <TextInput
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-lg font-medium text-neutral-900 dark:text-neutral-100"
            placeholder="z.B. Goethe-Gymnasium..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {isLoading && (
            <View className="absolute right-4 top-4 z-10">
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
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
};

export default InstitutionPicker;
