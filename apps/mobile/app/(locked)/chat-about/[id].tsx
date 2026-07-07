import ThemedListPreviewItem from '@/components/modals/themed-picker-modal/themed-list-preview-item';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { api } from '@/lib/api-client';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';

const ChatAboutPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('images');

  const { data: chatDetail } = useQuery({
    queryKey: ['chat', id],
    queryFn: async () => {
      if (typeof id !== 'string') {
        throw new Error('Invalid chat ID');
      }
      const { data, error } = await api.chats[id].get();
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });

  const onBackButtonPressed = () => {
    router.back();
  };

  const onEditButtonPressed = () => {};

  const peer = chatDetail?.peer;
  const members = peer ? [peer] : [];

  return (
    <View className="flex-1 bg-neutral-50">
      <SafeAreaView
        className="flex-row bg-transparent pt-[20px] px-[15px] justify-between pb-[10px]"
        edges={['top']}
      >
        <Button onPress={onBackButtonPressed}>
          <Icon name="arrow-left" />
          <Text>{APPLICATION_CONSTANTS.GENERAL_PREVIOUS_PAGE}</Text>
        </Button>
        <Button disabled onPress={onEditButtonPressed}>
          <Icon name="pencil" />
          <Text>{APPLICATION_CONSTANTS.CHAT_ABOUT_PAGE_EDIT_LABEL}</Text>
        </Button>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingVertical: 30,
          paddingHorizontal: 15,
          gap: 30,
        }}
        className="flex-1"
      >
        <Avatar size="lg"></Avatar>
        <View style={{ gap: 5, alignItems: 'center' }}>
          <Text variant="h2">{peer?.display_name ?? 'Chat'}</Text>
          <Text variant="caption">Direktnachricht</Text>
        </View>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="images">
              <Icon name="panorama" size={16} />
              <Text variant="caption">Bilder</Text>
            </TabsTrigger>
            <TabsTrigger value="files">
              <Icon name="file" size={16} />
              <Text variant="caption">Dateien</Text>
            </TabsTrigger>
            <TabsTrigger value="members">
              <Icon name="users-three" size={16} />
              <Text variant="caption">Mitglieder</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="images">
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingBottom: 15,
              }}
            >
              <Text variant="caption" className="text-neutral-600">
                Noch keine geteilten Bilder
              </Text>
            </ScrollView>
          </TabsContent>
          <TabsContent value="files">
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingBottom: 15,
              }}
            >
              <Text variant="caption" className="text-neutral-600">
                Noch keine geteilten Dateien
              </Text>
            </ScrollView>
          </TabsContent>
          <TabsContent value="members">
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 15,
                paddingBottom: 15,
                gap: 10,
              }}
            >
              {members.map((member) => (
                <ThemedListPreviewItem
                  key={member.user_id}
                  userId={member.user_id}
                  heading={member.display_name || ''}
                  className="bg-transparent"
                ></ThemedListPreviewItem>
              ))}
            </ScrollView>
          </TabsContent>
        </Tabs>
      </ScrollView>
    </View>
  );
};

export default ChatAboutPage;
