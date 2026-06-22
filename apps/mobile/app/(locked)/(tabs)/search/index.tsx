import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { api, type SearchResultsDto } from '@/lib/api-client';
import APPLICATION_CONSTANTS from '@/constants/strings';
import SearchCategorySection from '@/components/pages/search/search-category-section';
import SearchResultItem from '@/components/pages/search/search-result-item';
import SearchResultsModal from '@/components/modals/search-results-modal';
import { type ThemedSettingsItemProp } from '@/components/pages/settings/themed-settings-item';

// Copied from settings.tsx for client-side search
const settingsItems: ThemedSettingsItemProp[] = [
  {
    label: 'Benachrichtigungen',
    icomoonIcon: 'bell',
    type: 'switch',
    onPressAction: 'notification-press-action',
  },
  {
    label: 'Über die App',
    icomoonIcon: 'info',
    type: 'link',
    onPressAction: 'about-press-action',
  },
  {
    label: 'Hilfe erhalten',
    icomoonIcon: 'lifebuoy',
    type: 'link',
    onPressAction: 'show-help-press-action',
  },
  {
    label: 'Log Out',
    icomoonIcon: 'sign-out',
    type: 'link',
    onPressAction: 'log-out-press-action',
  },
];

type FilterType =
  | 'all'
  | 'contacts'
  | 'chats'
  | 'blackboards'
  | 'clubs'
  | 'settings';

export default function SearchIndex() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [results, setResults] = useState<SearchResultsDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCategory, setModalCategory] = useState<
    'contacts' | 'chats' | 'blackboards' | 'clubs' | 'settings'
  >('contacts');
  const [modalLabel, setModalLabel] = useState('');

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery) {
      setResults(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .search(debouncedQuery, 3)
      .then((res) => {
        if (isMounted) {
          setResults(res);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('Search error:', e);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Client side filtering for settings
  const filteredSettings = useMemo(() => {
    if (!debouncedQuery) {
      return [];
    }
    return settingsItems
      .filter((item) =>
        item.label.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
      .slice(0, 3);
  }, [debouncedQuery]);

  const hasSettingsMore = useMemo(() => {
    if (!debouncedQuery) {
      return false;
    }
    return (
      settingsItems.filter((item) =>
        item.label.toLowerCase().includes(debouncedQuery.toLowerCase()),
      ).length > 3
    );
  }, [debouncedQuery]);

  const handleShowMore = (category: typeof modalCategory, label: string) => {
    setModalCategory(category);
    setModalLabel(label);
    setModalVisible(true);
  };

  const handleResultPress = (type: string, data: any) => {
    setModalVisible(false);

    if (type === 'contact') {
      router.push(`/(auth)/user-card-page/${data.user_id}`);
    } else if (type === 'chat') {
      router.push(`/(locked)/chat/${data.chat_id}`);
    } else if (type === 'blackboard') {
      // router.push(`/blackboards/${data.id}`); // Not implemented yet
    } else if (type === 'club') {
      // router.push(`/clubs/${data.id}`); // Not implemented yet
    } else if (type === 'setting') {
      router.push(`/(locked)/(tabs)/settings`);
    }
  };

  const hasAnyResults =
    results &&
    ((results.contacts?.items.length ?? 0) > 0 ||
      (results.chats?.items.length ?? 0) > 0 ||
      (results.blackboards?.items.length ?? 0) > 0 ||
      (results.clubs?.items.length ?? 0) > 0 ||
      filteredSettings.length > 0);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: APPLICATION_CONSTANTS.SEARCH_PAGE_TITLE,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F9FAFB' },
          headerSearchBarOptions: {
            placeholder: APPLICATION_CONSTANTS.SEARCH_BAR_PLACEHOLDER,
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            hideWhenScrolling: false,
            obscureBackground: false,
          },
        }}
      />
      <SearchResultsModal
        visible={modalVisible}
        query={debouncedQuery}
        category={modalCategory}
        categoryLabel={modalLabel}
        onRequestClose={() => setModalVisible(false)}
        onResultPress={handleResultPress}
        settingsItems={settingsItems}
      />
      <ScrollView
        className="flex-1 bg-neutral-50"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        stickyHeaderIndices={[0]}
      >
        {/* Filter Chips */}
        <View className="py-[10px] bg-neutral-50 z-10">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 15, gap: 10 }}
          >
            {[
              {
                id: 'all',
                label: APPLICATION_CONSTANTS.SEARCH_FILTER_ALL,
                icon: 'list',
              },
              {
                id: 'contacts',
                label: APPLICATION_CONSTANTS.SEARCH_FILTER_CONTACTS,
                icon: 'users',
              },
              {
                id: 'chats',
                label: APPLICATION_CONSTANTS.SEARCH_FILTER_CHATS,
                icon: 'chat-circle',
              },
              {
                id: 'blackboards',
                label: APPLICATION_CONSTANTS.SEARCH_FILTER_BLACKBOARDS,
                icon: 'megaphone-simple',
              },
              {
                id: 'clubs',
                label: APPLICATION_CONSTANTS.SEARCH_FILTER_CLUBS,
                icon: 'users-three',
              },
              {
                id: 'settings',
                label: APPLICATION_CONSTANTS.SEARCH_FILTER_SETTINGS,
                icon: 'gear',
              },
            ].map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'primary' : 'normal'}
                onPress={() => setActiveFilter(filter.id as FilterType)}
                className="rounded-full px-[15px] py-[8px]"
              >
                {filter.icon ? (
                  <Icon
                    name={filter.icon as any}
                    size={16}
                    className={
                      activeFilter === filter.id
                        ? 'text-white'
                        : 'text-neutral-900'
                    }
                  />
                ) : null}
                <Text>{filter.label}</Text>
              </Button>
            ))}
          </ScrollView>
        </View>

        <View className="pb-[50px]">
          {!query ? (
            <View className="items-center justify-center pt-[100px]">
              <Icon
                name="magnifying-glass"
                size={48}
                className="text-neutral-300 mb-[15px]"
              />
              <Text variant="subHeading" className="text-neutral-400">
                {APPLICATION_CONSTANTS.SEARCH_EMPTY_STATE}
              </Text>
            </View>
          ) : loading && !results ? (
            <View className="pt-[50px]">
              <ActivityIndicator />
            </View>
          ) : !hasAnyResults ? (
            <View className="items-center justify-center pt-[100px]">
              <Text variant="subHeading" className="text-neutral-400">
                {APPLICATION_CONSTANTS.SEARCH_NO_RESULTS}
              </Text>
            </View>
          ) : (
            <View className="pt-[15px]">
              {/* Contacts */}
              {(activeFilter === 'all' || activeFilter === 'contacts') &&
              results?.contacts?.items.length ? (
                <SearchCategorySection
                  title={APPLICATION_CONSTANTS.SEARCH_CATEGORY_CONTACTS}
                  icon="users"
                  hasMore={results.contacts.has_more}
                  onShowMore={() =>
                    handleShowMore(
                      'contacts',
                      APPLICATION_CONSTANTS.SEARCH_CATEGORY_CONTACTS,
                    )
                  }
                >
                  {results.contacts.items.map((contact) => (
                    <SearchResultItem
                      key={contact.user_id}
                      type="contact"
                      data={contact}
                      onPress={() => handleResultPress('contact', contact)}
                    />
                  ))}
                </SearchCategorySection>
              ) : null}

              {/* Chats */}
              {(activeFilter === 'all' || activeFilter === 'chats') &&
              results?.chats?.items.length ? (
                <SearchCategorySection
                  title={APPLICATION_CONSTANTS.SEARCH_CATEGORY_CHATS}
                  icon="chat-circle"
                  hasMore={results.chats.has_more}
                  onShowMore={() =>
                    handleShowMore(
                      'chats',
                      APPLICATION_CONSTANTS.SEARCH_CATEGORY_CHATS,
                    )
                  }
                >
                  {results.chats.items.map((chat) => (
                    <SearchResultItem
                      key={chat.chat_id}
                      type="chat"
                      data={chat}
                      onPress={() => handleResultPress('chat', chat)}
                    />
                  ))}
                </SearchCategorySection>
              ) : null}

              {/* Blackboards */}
              {(activeFilter === 'all' || activeFilter === 'blackboards') &&
              results?.blackboards?.items.length ? (
                <SearchCategorySection
                  title={APPLICATION_CONSTANTS.SEARCH_CATEGORY_BLACKBOARDS}
                  icon="megaphone-simple"
                  hasMore={results.blackboards.has_more}
                  onShowMore={() =>
                    handleShowMore(
                      'blackboards',
                      APPLICATION_CONSTANTS.SEARCH_CATEGORY_BLACKBOARDS,
                    )
                  }
                >
                  {results.blackboards.items.map((post) => (
                    <SearchResultItem
                      key={post.id}
                      type="blackboard"
                      data={post}
                      onPress={() => handleResultPress('blackboard', post)}
                    />
                  ))}
                </SearchCategorySection>
              ) : null}

              {/* Clubs */}
              {(activeFilter === 'all' || activeFilter === 'clubs') &&
              results?.clubs?.items.length ? (
                <SearchCategorySection
                  title={APPLICATION_CONSTANTS.SEARCH_CATEGORY_CLUBS}
                  icon="users-three"
                  hasMore={results.clubs.has_more}
                  onShowMore={() =>
                    handleShowMore(
                      'clubs',
                      APPLICATION_CONSTANTS.SEARCH_CATEGORY_CLUBS,
                    )
                  }
                >
                  {results.clubs.items.map((club) => (
                    <SearchResultItem
                      key={club.id}
                      type="club"
                      data={club}
                      onPress={() => handleResultPress('club', club)}
                    />
                  ))}
                </SearchCategorySection>
              ) : null}

              {/* Settings */}
              {(activeFilter === 'all' || activeFilter === 'settings') &&
              filteredSettings.length ? (
                <SearchCategorySection
                  title={APPLICATION_CONSTANTS.SEARCH_CATEGORY_SETTINGS}
                  icon="gear"
                  hasMore={hasSettingsMore}
                  onShowMore={() =>
                    handleShowMore(
                      'settings',
                      APPLICATION_CONSTANTS.SEARCH_CATEGORY_SETTINGS,
                    )
                  }
                >
                  {filteredSettings.map((setting) => (
                    <SearchResultItem
                      key={setting.label}
                      type="setting"
                      data={setting}
                      onPress={() => handleResultPress('setting', setting)}
                    />
                  ))}
                </SearchCategorySection>
              ) : null}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
