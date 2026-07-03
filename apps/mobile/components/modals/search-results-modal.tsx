import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api-client';
import SearchResultItem from '../pages/search/search-result-item';

export type SearchResultsModalProps = {
  visible: boolean;
  query: string;
  category: 'contacts' | 'chats' | 'blackboards' | 'clubs' | 'settings';
  categoryLabel: string;
  onRequestClose: () => void;
  onResultPress: (type: string, data: any) => void;
  // For settings, we pass the items down since it's client-side
  settingsItems?: any[];
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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchResults = useCallback(
    async (isLoadMore = false) => {
      if (category === 'settings') {
        // Client-side filtering
        const filtered = settingsItems.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        );
        setItems(filtered);
        setHasMore(false);
        return;
      }

      const currentOffset = isLoadMore ? offset : 0;

      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const { data: res, error } = await api.search.get({
          $query: {
            q: query,
            category: category,
            limit: PAGE_SIZE,
            offset: currentOffset,
          },
        });
        if (error) {throw error;}

        const categoryResults = res[category];
        if (categoryResults) {
          if (isLoadMore) {
            setItems((prev) => [...prev, ...categoryResults.items]);
          } else {
            setItems(categoryResults.items);
          }
          setHasMore(categoryResults.has_more);
          setOffset(currentOffset + PAGE_SIZE);
        }
      } catch (e) {
        console.error('Failed to fetch category search results:', e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, category, offset, settingsItems],
  );

  useEffect(() => {
    if (visible && query) {
      setOffset(0);
      setHasMore(true);
      fetchResults(false);
    } else if (!visible) {
      setItems([]);
      setOffset(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, query, category]); // We explicitly don't depend on fetchResults to avoid loops

  const renderItemType =
    category === 'contacts'
      ? 'contact'
      : category === 'chats'
        ? 'chat'
        : category === 'blackboards'
          ? 'blackboard'
          : category === 'clubs'
            ? 'club'
            : 'setting';

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
          keyExtractor={(item, index) =>
            item.id ||
            item.user_id ||
            item.chat_id ||
            item.label ||
            index.toString()
          }
          contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: 50,
            paddingTop: 10,
          }}
          ItemSeparatorComponent={() => <Separator className="my-[5px]" />}
          renderItem={({ item }) => (
            <SearchResultItem
              type={renderItemType as any}
              data={item}
              onPress={() => onResultPress(renderItemType, item)}
            />
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
