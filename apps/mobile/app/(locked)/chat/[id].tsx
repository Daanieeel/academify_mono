import ThemedMessageWrapper from '@/components/pages/chat-page/message-components/themed-message-wrapper';
import ThemedChatPageFooter from '@/components/pages/chat-page/themed-chat-page-footer';
import ThemedChatPageHeader from '@/components/pages/chat-page/themed-chat-page-header';
import { useSession } from '@/context/auth-context';
import { useChatThread } from '@/hooks/use-chat-thread';
import { formatChatTimestamp } from '@/lib/format';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';

const ChatPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { peer, messages, mlsError, sendMessage } = useChatThread(id);

  const isScrollingRef = useRef(false);

  const [footerCurrentDisplay, setFooterCurrentDisplay] = useState<
    'keyboard' | 'none' | 'attachments'
  >('none');

  const bgTop = useThemeColor({}, 'neutral-50');
  const bgBottom = useThemeColor({}, 'neutral-100');

  const onChatAboutPressed = () => {
    router.push(`/(locked)/chat-about/${id}`);
  };

  const onSend = (text: string) => {
    sendMessage(text).catch((error) => {
      console.error('failed to send message:', error);
    });
  };

  return (
    <View className="flex-1 justify-between flex-col bg-neutral-50">
      {/* Header for the chat page including a back button, chat preview and more button */}
      <View className="z-10 bg-transparent">
        <ThemedChatPageHeader
          onChatAboutPressed={onChatAboutPressed}
          chatName={peer?.display_name}
        ></ThemedChatPageHeader>

        {mlsError ? (
          <View style={{ paddingHorizontal: 15, paddingVertical: 8 }}>
            <Text variant="caption">{mlsError}</Text>
          </View>
        ) : null}
      </View>

      {/* Container for the actual message list */}

      <View className="flex-1 z-0 overflow-visible">
        <View className="absolute bottom-0 top-0 left-0 right-0 -z-10">
          <LinearGradient colors={[bgTop, bgBottom]} style={{ flex: 1 }} />
        </View>
        <FlatList
          style={{ marginTop: -150, marginBottom: -150 }}
          onScrollBeginDrag={() => {
            isScrollingRef.current = true;
          }}
          onScrollEndDrag={() => {
            isScrollingRef.current = false;
          }}
          onMomentumScrollBegin={() => {
            isScrollingRef.current = true;
          }}
          onMomentumScrollEnd={() => {
            isScrollingRef.current = false;
          }}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="never"
          inverted
          contentContainerStyle={{
            paddingBottom: 160,
            paddingTop: 160,
          }}
          onTouchEnd={() => {
            if (!isScrollingRef.current) {
              setFooterCurrentDisplay('none');
            }
          }}
          className="flex-1 py-[10px] px-[5px]"
          data={[...messages].reverse()}
          keyExtractor={(message) => message.id}
          scrollEventThrottle={16}
          ItemSeparatorComponent={() => <View style={{ height: 15 }}></View>}
          renderItem={({ item }) => (
            <ThemedMessageWrapper
              messageId={item.id}
              userIsSender={item.senderUserId === session?.userId}
              textContent={{ message: item.text }}
              senderName={
                item.senderUserId === session?.userId
                  ? 'Du'
                  : (peer?.display_name ?? '...')
              }
              sendDate={formatChatTimestamp(item.createdAt)}
            ></ThemedMessageWrapper>
          )}
        ></FlatList>
      </View>

      {/* Footer inluding the input field and asset buttons */}

      <ThemedChatPageFooter
        currentDisplay={footerCurrentDisplay}
        setCurrentDisplay={setFooterCurrentDisplay}
        onSend={onSend}
      ></ThemedChatPageFooter>
    </View>
  );
};

export default ChatPage;
