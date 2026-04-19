import SmallButton from "@/components/buttons/small-button";
import ProfilePic from "@/components/profile-pic";
import ThemedBentoBox from "@/components/themed-bento-box";
import ThemedSearchBar from "@/components/themed-search-bar";
import { ThemedText } from "@/components/themed-text";
import APPLICATION_CONSTANTS from "@/constants/strings";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_CHAT_ABOUT_PAGE_DATA: ChatAboutPageProps = {
  chatName: "Chemie K2A24",
  chatImage: "",
  chatType: "Gruppe",
  userList: [],
  chatImages: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQQka_c7bNInUCQfyshB5XCKvW2_H-4Wrsug&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQQka_c7bNInUCQfyshB5XCKvW2_H-4Wrsug&s",
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

  const neutral50Color = useThemeColor({}, "neutral-50");

  const [searchBarInput, setSearchBarInput] = useState("");

  const onSearchBarInputChanged = (input: string) => {
    setSearchBarInput(input);
  };

  const onBackButtonPressed = () => {
    router.back();
  };

  const onEditButtonPressed = () => {};

  return (
    <View
      style={[
        {
          backgroundColor: neutral50Color,
        },
        styles["main-container"],
      ]}
    >
      <SafeAreaView style={styles["header"]} edges={["top"]}>
        <SmallButton
          iconName="arrow-left"
          label={APPLICATION_CONSTANTS.GENERAL_PREVIOUS_PAGE}
          onPress={onBackButtonPressed}
        ></SmallButton>
        <SmallButton
          disabled
          iconName="pencil"
          label={APPLICATION_CONSTANTS.CHAT_ABOUT_PAGE_EDIT_LABEL}
          onPress={onEditButtonPressed}
        ></SmallButton>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingVertical: 30,
          paddingHorizontal: 15,
          gap: 30,
        }}
        style={styles["scroll-view"]}
      >
        <ProfilePic size="large"></ProfilePic>
        <View style={{ gap: 5, alignItems: "center" }}>
          <ThemedText type="heading2">{data.chatName}</ThemedText>
          <ThemedText type="caption">
            {data.chatType + " • " + data.userList.length + " Mitglieder"}
          </ThemedText>
        </View>
        <ThemedSearchBar
          placeholder={APPLICATION_CONSTANTS.CHAT_ABOUT_PAGE_SEARCH_BAR_LABEL}
          value={searchBarInput}
          onInputChanged={onSearchBarInputChanged}
        ></ThemedSearchBar>
        <ThemedBentoBox title={"Geteilte Bilder"} icomoonIcon={"panorama"}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 15,
              paddingBottom: 15,
              gap: 10,
            }}
            horizontal
            style={{}}
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
        </ThemedBentoBox>
        <ThemedBentoBox title={"Geteilte Dateien"} icomoonIcon={"file"}>
          <ScrollView style={{}}></ScrollView>
        </ThemedBentoBox>
        <ThemedBentoBox title={"Mitglieder"} icomoonIcon={"users-three"}>
          <ScrollView style={{}}></ScrollView>
        </ThemedBentoBox>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  "main-container": {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    backgroundColor: "transparent",
    paddingTop: 20,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  "scroll-view": {
    flex: 1,
  },
});

export default ChatAboutPage;
