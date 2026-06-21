import ThemedCreateChatModal from '@/components/modals/themed-create-chat-modal';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import ThemedChatPreview, {
  type ThemedChatPreviewProps,
} from '@/components/pages/chats/themed-chat-preview';

import ThemedErrorBackground from '@/components/themed-error-background';
import ThemedHeader from '@/components/themed-header';
import ThemedPressable from '@/components/themed-pressable';
import ThemedSearchBar from '@/components/themed-search-bar';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { useChats } from '@/hooks/use-chats';
import { formatChatTimestamp } from '@/lib/format';
import type { ChatListEntry } from '@/lib/api-client';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';

const HEADER_MAX_HEIGHT = 150;
const HEADER_MIN_HEIGHT = 75;

function toPreviewProps(chat: ChatListEntry): ThemedChatPreviewProps {
  return {
    chatName: chat.peer?.display_name ?? 'Chat',
    lastMessageTime: chat.last_message_at
      ? formatChatTimestamp(chat.last_message_at)
      : undefined,
    lastMessage: chat.last_message_at
      ? chat.read
        ? 'Verschlüsselte Nachricht'
        : 'Neue verschlüsselte Nachricht'
      : undefined,
    lastMessageType: 'text',
    read: chat.read,
  };
}

const Chats = () => {
  const safeArea = useSafeAreaInsets();
  const bottomInset = safeArea.bottom > 0 ? 83 : 56;

  const scrollY = useSharedValue(0);
  const { chats, loading } = useChats();

  const [searchText, setSearchText] = useState('');
  const [modalShown, setModalShown] = useState(false); // Modal for create a new chat
  const [chatModalMode, setChatModalMode] = useState<'single' | 'group'>(
    'group',
  );
  const [newChatMenuOpen, setNewChatMenuOpen] = useState(false);
  const newChatMenuProgress = useSharedValue(0);

  useEffect(() => {
    newChatMenuProgress.value = withSpring(newChatMenuOpen ? 1 : 0, {
      damping: 19,
      stiffness: 420,
      mass: 0.45,
    });
  }, [newChatMenuOpen, newChatMenuProgress]);

  const newChatOptionsStyle = useAnimatedStyle(() => ({
    opacity: newChatMenuProgress.value,
    transform: [{ scale: 0.85 + 0.15 * newChatMenuProgress.value }],
  }));

  const newChatMainButtonStyle = useAnimatedStyle(() => ({
    opacity: 1 - newChatMenuProgress.value,
    transform: [{ scale: 1 - 0.1 * newChatMenuProgress.value }],
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  const onSearchBarInputChanged = (input: string) => {
    setSearchText(input);
  };

  const onNewChatTogglePressed = () => {
    setNewChatMenuOpen((prev) => !prev);
  };

  const onChatModeSelected = (mode: 'single' | 'group') => {
    setChatModalMode(mode);
    setNewChatMenuOpen(false);
    setModalShown(true);
  };

  const onChatPressed = (chatId: string) => {
    router.push(`/(locked)/chat/${chatId}`);
  };

  const onChatCreated = (chatId: string) => {
    setModalShown(false);
    router.push(`/(locked)/chat/${chatId}`);
  };

  return (
    <View className="flex-1 bg-neutral-50">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      ></Stack.Screen>

      <ThemedCreateChatModal
        visible={modalShown}
        mode={chatModalMode}
        onRequestClose={() => setModalShown(false)}
        onChatCreated={onChatCreated}
      ></ThemedCreateChatModal>

      {/* HEADER */}
      <SafeAreaView edges={['top']}>
        <Animated.View style={headerStyle}>
          <View className="overflow-hidden">
            <ThemedHeader
              headerTitle={APPLICATION_CONSTANTS.CHATS_PAGE_HEADER}
              headerSearchBar={
                <ThemedSearchBar
                  placeholder={
                    APPLICATION_CONSTANTS.CHATS_PAGE_SEARCH_BAR_PLACEHOLDER
                  }
                  value={searchText}
                  onInputChanged={onSearchBarInputChanged}
                ></ThemedSearchBar>
              }
              headerCompRight={<Avatar size="small"></Avatar>}
            ></ThemedHeader>
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* Loading state: skeleton placeholder rows */}
      {loading ? (
        <View className="pt-[10px] px-[15px] gap-[15px]">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              className="h-[80px] items-center w-full flex-row gap-[15px]"
            >
              <Skeleton className="h-[45px] w-[45px] rounded-full" />
              <View className="gap-[10px] flex-1">
                <Skeleton className="h-[14px] w-[50%]" />
                <Skeleton className="h-[14px] w-[80%]" />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <>
          {/* If no chats are available: INFO */}
          {chats.length === 0 ? (
            <View className="w-full h-[60%] items-center justify-center">
              <ThemedErrorBackground
                title={
                  APPLICATION_CONSTANTS.CHATS_PAGE_NO_CHATS_AVAILABLE_HEADING
                }
                description={
                  APPLICATION_CONSTANTS.CHATS_PAGE_NO_CHATS_AVAILABLE_DESCRIPTION
                }
              ></ThemedErrorBackground>
            </View>
          ) : undefined}

          {/* LIST */}
          <Animated.FlatList
            onScroll={scrollHandler}
            contentContainerStyle={{ paddingBottom: 100 }}
            ItemSeparatorComponent={() => <Separator></Separator>}
            className="pt-[10px] pb-[50px] px-[15px]"
            data={chats}
            keyExtractor={(chat) => chat.chat_id}
            renderItem={({ item }) => (
              <ThemedPressable onPress={() => onChatPressed(item.chat_id)}>
                <ThemedChatPreview
                  {...toPreviewProps(item)}
                ></ThemedChatPreview>
              </ThemedPressable>
            )}
          ></Animated.FlatList>
        </>
      )}

      {newChatMenuOpen ? (
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0"
          onPress={onNewChatTogglePressed}
        />
      ) : undefined}

      <View
        className="absolute left-0 right-0"
        style={{ bottom: bottomInset + 15, height: 60 }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
            },
            newChatOptionsStyle,
          ]}
          pointerEvents={newChatMenuOpen ? 'auto' : 'none'}
        >
          <View className="flex-row items-center gap-[8px]">
            <Button
              variant="inverted"
              onPress={() => onChatModeSelected('single')}
              className="px-[16px] py-[14px] rounded-[22px]"
            >
              <Icon name="user" size={20} />
              <Text>Einzel</Text>
            </Button>
            <Button
              variant="inverted"
              onPress={() => onChatModeSelected('group')}
              className="px-[16px] py-[14px] rounded-[22px]"
            >
              <Icon name="users-three" size={20} />
              <Text>Gruppe</Text>
            </Button>
            <Button
              variant="normal"
              onPress={onNewChatTogglePressed}
              className="p-0 rounded-[24px]"
              style={{ height: 48, width: 48 }}
            >
              <Icon name="x" size={22} className="text-neutral-900" />
            </Button>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
            },
            newChatMainButtonStyle,
          ]}
          pointerEvents={newChatMenuOpen ? 'none' : 'auto'}
        >
          <Button
            variant="inverted"
            onPress={onNewChatTogglePressed}
            className="px-[24px] py-[14px] rounded-[22px]"
          >
            <Icon name="magic-wand" size={22} />
            <Text>
              {APPLICATION_CONSTANTS.CHATS_PAGE_NEW_CHAT_BUTTON_LABEL}
            </Text>
          </Button>
        </Animated.View>
      </View>
    </View>
  );
};

export default Chats;
