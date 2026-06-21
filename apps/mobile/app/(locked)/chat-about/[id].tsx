import ThemedSearchBar from '@/components/themed-search-bar';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';

const MOCK_CHAT_ABOUT_PAGE_DATA: ChatAboutPageProps = {
  chatName: 'Chemie K2A24',
  chatImage: '',
  chatType: 'Gruppe',
  userList: [],
  chatImages: [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQQka_c7bNInUCQfyshB5XCKvW2_H-4Wrsug&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQQka_c7bNInUCQfyshB5XCKvW2_H-4Wrsug&s',
  ],
  chatFiles: [],
};

export type ChatAboutPageProps = {
  chatImage: string;
  chatName: string;
  chatType: string;
  userList: string[];
  chatImages: string[];
  chatFiles: string[];
};

const ChatAboutPage = () => {
  const data = MOCK_CHAT_ABOUT_PAGE_DATA;

  const [searchBarInput, setSearchBarInput] = useState('');
  const [activeTab, setActiveTab] = useState('images');

  const onSearchBarInputChanged = (input: string) => {
    setSearchBarInput(input);
  };

  const onBackButtonPressed = () => {
    router.back();
  };

  const onEditButtonPressed = () => {};

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
        <Avatar size="large"></Avatar>
        <View style={{ gap: 5, alignItems: 'center' }}>
          <Text variant="heading2">{data.chatName}</Text>
          <Text variant="caption">
            {data.chatType + ' • ' + data.userList.length + ' Mitglieder'}
          </Text>
        </View>
        <ThemedSearchBar
          placeholder={APPLICATION_CONSTANTS.CHAT_ABOUT_PAGE_SEARCH_BAR_LABEL}
          value={searchBarInput}
          onInputChanged={onSearchBarInputChanged}
        ></ThemedSearchBar>
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
                gap: 10,
              }}
              horizontal
            >
              {data.chatImages.map((imageUri, index) => {
                return (
                  <Image
                    borderRadius={10}
                    height={100}
                    width={100}
                    key={index}
                    source={{ uri: imageUri }}
                  ></Image>
                );
              })}
            </ScrollView>
          </TabsContent>
          <TabsContent value="files">
            <ScrollView></ScrollView>
          </TabsContent>
          <TabsContent value="members">
            <ScrollView></ScrollView>
          </TabsContent>
        </Tabs>
      </ScrollView>
    </View>
  );
};

export default ChatAboutPage;
