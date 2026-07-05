import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api-client';
import SearchResultItem, {
  type SearchResultItemProps,
} from '../pages/search/search-result-item';
import type { ThemedSettingsItemProp } from '../../../app/(locked)/(tabs)/settings';

export type SearchResultsModalProps = {
  visible: boolean;
  query: string;
  category: 'contacts' | 'chats' | 'blackboards' | 'clubs' | 'settings';
  categoryLabel: string;
  onRequestClose: () => void;
  onResultPress: (item: Omit<SearchResultItemProps, 'onPress'>) => void;
  // For settings, we pass the items down since it's client-side
  settingsItems?: ThemedSettingsItemProp[];
};

const PAGE_SIZE = 20;

const SearchResultsModal = ({
  visible,
  query,
  category,
  categoryLabel,
  onRequestClose,
  onResultPress,
  settingsItems = [],
}: SearchResultsModalProps) => {
  const [items, setItems] = useState<Omit<SearchResultItemProps, 'onPress'>[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offset = React.useRef(0);

  const fetchResults = useCallback(
    async (isLoadMore = false) => {
      if (category === 'settings') {
        // Client-side filtering
        const filtered = settingsItems.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        );
        setItems(filtered.map((data) => ({ type: 'setting', data })));
        setHasMore(false);
        return;
      }

      const currentOffset = isLoadMore ? offset.current : 0;

      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const { data: res, error } = await api.search.get({
          $query: {
            q: query,
            category,
            limit: PAGE_SIZE,
            offset: currentOffset,
          },
        });
        if (error) {
          throw error;
        }

        let newItems: Omit<SearchResultItemProps, 'onPress'>[] = [];
        let newHasMore = false;

        if (category === 'contacts' && res.contacts) {
          newItems = res.contacts.items.map((data) => ({
            type: 'contact',
            data,
          }));
          newHasMore = res.contacts.has_more;
        } else if (category === 'chats' && res.chats) {
          newItems = res.chats.items.map((data) => ({ type: 'chat', data }));
          newHasMore = res.chats.has_more;
        } else if (category === 'blackboards' && res.blackboards) {
          newItems = res.blackboards.items.map((data) => ({
            type: 'blackboard',
            data,
          }));
          newHasMore = res.blackboards.has_more;
        } else if (category === 'clubs' && res.clubs) {
          newItems = res.clubs.items.map((data) => ({ type: 'club', data }));
          newHasMore = res.clubs.has_more;
        }

        if (isLoadMore) {
          setItems((prev) => [...prev, ...newItems]);
        } else {
          setItems(newItems);
        }
        setHasMore(newHasMore);
        offset.current = currentOffset + PAGE_SIZE;
      } catch (e) {
        console.error('Failed to fetch category search results:', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, category, settingsItems],
  );

  useEffect(() => {
    if (visible && query) {
      offset.current = 0;
      setHasMore(true);
      void fetchResults(false);
    } else if (!visible) {
      setItems([]);
      offset.current = 0;
    }
  }, [visible, query, category, fetchResults]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 bg-neutral-50">
        <SafeAreaView edges={['top']} className="bg-neutral-50">
          <View className="flex-row items-center justify-between px-[15px] pt-[20px] pb-[10px]">
            <Button onPress={onRequestClose} className="p-0">
              <Text className="text-primary-900 font-semibold text-[17px]">
                Fertig
              </Text>
            </Button>
            <Text variant="heading2">{categoryLabel}</Text>
            <View className="w-[50px]" />
          </View>
        </SafeAreaView>

        <FlatList
          data={items}
          keyExtractor={(item, index) => {
            if (item.type === 'contact') {
              return item.data.user_id;
            }
            if (item.type === 'chat') {
              return item.data.chat_id;
            }
            if (item.type === 'blackboard') {
              return item.data.id;
            }
            if (item.type === 'club') {
              return item.data.id;
            }
            if (item.type === 'setting') {
              return item.data.label;
            }
            return index.toString();
          }}
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: 50,
            paddingTop: 10,
          }}
          ItemSeparatorComponent={() => <Separator className="my-[5px]" />}
          renderItem={({ item }) => (
            <SearchResultItem {...item} onPress={() => onResultPress(item)} />
          )}
          ListEmptyComponent={
            loading ? (
              <View className="py-[30px] items-center">
                <ActivityIndicator />
              </View>
            ) : (
              <View className="py-[30px] items-center">
                <Text variant="body" className="text-neutral-500">
                  Keine weiteren Ergebnisse
                </Text>
              </View>
            )
          }
          onEndReached={() => {
            if (hasMore && !loading && !loadingMore) {
              fetchResults(true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-[20px] items-center">
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      </View>
    </Modal>
  );
};

export default SearchResultsModal;
