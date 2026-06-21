import ThemedMessageWrapper from '@/components/pages/chat-page/message-components/themed-message-wrapper';
import ThemedChatPageFooter from '@/components/pages/chat-page/themed-chat-page-footer';
import ThemedChatPageHeader from '@/components/pages/chat-page/themed-chat-page-header';
import ThemedAcademiBackground from '@/components/themed-academi-background';
import { useSession } from '@/context/auth-context';
import { useChatThread } from '@/hooks/use-chat-thread';
import { formatChatTimestamp } from '@/lib/format';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Text } from '@/components/ui/text';

const ChatPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { peer, messages, mlsError, sendMessage } = useChatThread(id);

  const isScrollingRef = useRef(false);

  const [footerCurrentDisplay, setFooterCurrentDisplay] = useState<
    'keyboard' | 'none' | 'attachments'
  >('none');

  const onChatAboutPressed = () => {
    router.push('/(locked)/chat-about/123');
  };

  const onSend = (text: string) => {
    sendMessage(text).catch((error) => {
      console.error('failed to send message:', error);
    });
  };

  return (
    <View className="flex-1 justify-between flex-col bg-neutral-50">
      {/* Header for the chat page including a back button, chat preview and more button */}

      <ThemedChatPageHeader
        onChatAboutPressed={onChatAboutPressed}
        chatName={peer?.display_name}
      ></ThemedChatPageHeader>

      {mlsError ? (
        <View style={{ paddingHorizontal: 15, paddingVertical: 8 }}>
          <Text variant="caption">{mlsError}</Text>
        </View>
      ) : null}

      {/* Container for the actual message list */}

      <View className="flex-1">
        <FlatList
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
            paddingBottom: 10,
          }}
          onTouchEnd={() => {
            if (!isScrollingRef.current) {
              setFooterCurrentDisplay('none');
            }
          }}
          className="z-[9999] flex-1 py-[10px] px-[5px]"
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
        <View className="absolute bottom-0 top-0 left-0 right-0">
          <ThemedAcademiBackground></ThemedAcademiBackground>
        </View>
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
