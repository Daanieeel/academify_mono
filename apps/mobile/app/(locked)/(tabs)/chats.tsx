import SimpleButton from "@/components/buttons/simple-button";
import ThemedCreateChatModal from "@/components/modals/themed-create-chat-modal";
import ThemedChatPreview from "@/components/pages/chats/themed-chat-preview";

import ProfilePic from "@/components/profile-pic";
import ThemedDivider from "@/components/themed-divider";
import ThemedErrorBackground from "@/components/themed-error-background";
import ThemedHeader from "@/components/themed-header";
import ThemedPressable from "@/components/themed-pressable";
import ThemedSearchBar from "@/components/themed-search-bar";
import { mockChats } from "@/constants/mock-data/ExampleChatPreviews";
import APPLICATION_CONSTANTS from "@/constants/strings";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const HEADER_MAX_HEIGHT = 150;
const HEADER_MIN_HEIGHT = 75;

const Chats = () => {
  const neutral50Color = useThemeColor({}, "neutral-50");
  const neutral200Color = useThemeColor({}, "neutral-200");

  const scrollY = useSharedValue(0);

  const [searchText, setSearchText] = useState("");
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

  const onSearchBarInputChanged = (input: string) => {};

  const onNewChatPressed = () => {
    setModalShown(true);
  };

  const onChatPressed = () => {
    router.push("/(locked)/chat/asdflk");
  };

  return (
    <View
      style={[styles["main-container"], { backgroundColor: neutral50Color }]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      ></Stack.Screen>

      <ThemedCreateChatModal
        visible={modalShown}
        onRequestClose={() => setModalShown(false)}
      ></ThemedCreateChatModal>

      {/* HEADER */}
      <SafeAreaView edges={["top"]}>
        <Animated.View style={[headerStyle, { overflow: "hidden" }]}>
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
      {mockChats.length == 0 ? (
        <View
          style={{
            width: "100%",
            height: "60%",
            alignItems: "center",
            justifyContent: "center",
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
        style={styles["flat-list"]}
        data={mockChats}
        renderItem={(mockChat) => (
          <ThemedPressable onPress={onChatPressed}>
            <ThemedChatPreview {...mockChat.item}></ThemedChatPreview>
          </ThemedPressable>
        )}
      ></Animated.FlatList>

      <View style={styles["new-chat-button-wrapper"]}>
        <SimpleButton
          icomoonIcon="magic-wand"
          label={APPLICATION_CONSTANTS.CHATS_PAGE_NEW_CHAT_BUTTON_LABEL}
          onPress={onNewChatPressed}
          type={"primary"}
        ></SimpleButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  "main-container": {
    flex: 1,
  },

  "new-chat-button-wrapper": {
    alignItems: "center",
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: "center",
    position: "absolute",
  },
  "flat-list": {
    paddingTop: 10,
    paddingBottom: 50,
    paddingHorizontal: 15,
  },
});

export default Chats;
