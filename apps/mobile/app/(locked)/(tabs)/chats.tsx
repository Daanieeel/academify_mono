import SimpleButton from '@/components/buttons/simple-button';
import ThemedCreateChatModal from '@/components/modals/themed-create-chat-modal';
import ThemedChatPreview, {
  type ThemedChatPreviewProps,
} from '@/components/pages/chats/themed-chat-preview';

import ProfilePic from '@/components/profile-pic';
import ThemedDivider from '@/components/themed-divider';
import ThemedErrorBackground from '@/components/themed-error-background';
import ThemedHeader from '@/components/themed-header';
import ThemedPressable from '@/components/themed-pressable';
import ThemedSearchBar from '@/components/themed-search-bar';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useChats } from '@/hooks/use-chats';
import { formatChatTimestamp } from '@/lib/format';
import type { ChatListEntry } from '@/lib/api-client';
import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

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
  const neutral50Color = useThemeColor({}, 'neutral-50');
  const safeArea = useSafeAreaInsets();
  const bottomInset = safeArea.bottom > 0 ? 105 : 75;

  const scrollY = useSharedValue(0);
  const { chats } = useChats();

  const [searchText, setSearchText] = useState('');
  const [modalShown, setModalShown] = useState(false); // Modal for create a new chat

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

  const onNewChatPressed = () => {
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
    <View
      style={[styles['main-container'], { backgroundColor: neutral50Color }]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      ></Stack.Screen>

      <ThemedCreateChatModal
        visible={modalShown}
        onRequestClose={() => setModalShown(false)}
        onChatCreated={onChatCreated}
      ></ThemedCreateChatModal>

      {/* HEADER */}
      <SafeAreaView edges={['top']}>
        <Animated.View style={[headerStyle, { overflow: 'hidden' }]}>
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
            headerCompRight={<ProfilePic size="small"></ProfilePic>}
          ></ThemedHeader>
        </Animated.View>
      </SafeAreaView>

      {/* If no chats are available: INFO */}
      {chats.length === 0 ? (
        <View
          style={{
            width: '100%',
            height: '60%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThemedErrorBackground
            title={APPLICATION_CONSTANTS.CHATS_PAGE_NO_CHATS_AVAILABLE_HEADING}
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
        ItemSeparatorComponent={() => <ThemedDivider></ThemedDivider>}
        style={styles['flat-list']}
        data={chats}
        keyExtractor={(chat) => chat.chat_id}
        renderItem={({ item }) => (
          <ThemedPressable onPress={() => onChatPressed(item.chat_id)}>
            <ThemedChatPreview {...toPreviewProps(item)}></ThemedChatPreview>
          </ThemedPressable>
        )}
      ></Animated.FlatList>

      <View
        style={[
          styles['new-chat-button-wrapper'],
          { bottom: bottomInset + 30 },
        ]}
      >
        <SimpleButton
          icomoonIcon="magic-wand"
          label={APPLICATION_CONSTANTS.CHATS_PAGE_NEW_CHAT_BUTTON_LABEL}
          onPress={onNewChatPressed}
          type={'primary'}
        ></SimpleButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  'main-container': {
    flex: 1,
  },

  'new-chat-button-wrapper': {
    alignItems: 'center',
    left: 0,
    right: 0,
    justifyContent: 'center',
    position: 'absolute',
  },
  'flat-list': {
    paddingTop: 10,
    paddingBottom: 50,
    paddingHorizontal: 15,
  },
});

export default Chats;
