import SimpleButton from "@/components/buttons/simple-button";
import SmallButton from "@/components/buttons/small-button";
import ThemedModal from "@/components/modals/themed-modal";
import ThemedListPreviewItem, {
  ThemedListPreviewItemProps,
} from "@/components/modals/themed-picker-modal/themed-list-preview-item";
import ThemedPickerModal from "@/components/modals/themed-picker-modal/themed-picker-modal";
import ProfilePic from "@/components/profile-pic";
import ThemedDivider from "@/components/themed-divider";
import ThemedSlider from "@/components/themed-slider";
import { ThemedText } from "@/components/themed-text";
import ThemedTextField from "@/components/themed-text-field";
import APPLICATION_CONSTANTS from "@/constants/strings";
import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import ThemedPressable from "../themed-pressable";
import ThemedImagePickerModal, {
  IMAGE_URIS,
} from "./themed-image-picker-modal";

const MOCK_USERS: ThemedListPreviewItemProps[] = [
  { heading: "Maxine Maxwell", userId: 0, caption: "Klasse: 9d" },
  { heading: "Linus Bung", userId: 1, caption: "Klasse: 9d" },
  { heading: "Daniel Dopatka", userId: 2, caption: "Klasse: 9d" },
  { heading: "Sophie Keller", userId: 3, caption: "Klasse: 9c" },
  { heading: "Leon Fischer", userId: 4, caption: "Klasse: 9c" },
];

const MOCK_CLASSES: ThemedListPreviewItemProps[] = [
  { heading: "Klasse 5a", userId: 0, caption: "21 Schüler" },
  { heading: "Klasse K1A24", userId: 1, caption: "21 Schüler" },
];

export type ThemedCreateChatModalProps = {
  visible: boolean;
  onRequestClose: () => void;
};

export type ThemedBentoBoxProps = {
  label?: string;
  children?: React.ReactNode;
};

const ThemedBentoBox = (props: ThemedBentoBoxProps) => {
  const backgroundColor = useThemeColor({}, "neutral-50");
  const textColor = useThemeColor({}, "neutral-600");

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: 18,
      }}
    >
      {props.label && (
        <ThemedText
          style={{
            paddingTop: 15,
            paddingLeft: 15,
          }}
          color={textColor}
          type="caption"
        >
          {props.label}
        </ThemedText>
      )}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 15,
          paddingBottom: 10,
        }}
      >
        {props.children}
      </View>
    </View>
  );
};

const ThemedCreateChatModal = (props: ThemedCreateChatModalProps) => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [selectUserModalShown, setSelectUserModalShown] = useState(false);
  const [avatarModalShown, setAvatarModalShown] = useState(false);
  const [avatarSource, setAvatarSource] = useState<string | undefined>(
    undefined,
  );

  const neutral600Color = useThemeColor({}, "neutral-600");
  const chatPreviewBackgroundColor = useThemeColor({}, "neutral-50");

  const onThemedSliderPress = (newIndex: number) => {
    setCurrentTab(newIndex);
  };

  const onRequestClosedTriggered = () => {
    props.onRequestClose();
    setCurrentTab(0);
  };

  const onAddUserPressed = () => {
    setSelectUserModalShown(true);
  };

  const onCreateChatPressed = () => {};

  const onAvatarPressed = () => {
    setAvatarModalShown(true);
  };

  return (
    <ThemedModal
      visible={props.visible}
      onRequestClose={onRequestClosedTriggered}
    >
      {/* Modal for picking a new Group Image */}
      <ThemedImagePickerModal
        images={IMAGE_URIS}
        onCallBack={(uri) => setAvatarSource(uri)}
        onRequestClose={() => setAvatarModalShown(false)}
        visible={avatarModalShown}
      ></ThemedImagePickerModal>

      {/* Modal for when the user wants to add additional single users */}
      <ThemedPickerModal
        visible={selectUserModalShown}
        onRequestClose={() => setSelectUserModalShown(false)}
      ></ThemedPickerModal>

      {/* Button for creating the group */}
      {currentTab == 0 ? (
        <View style={styles["finish-button"]}>
          <SimpleButton
            icomoonIcon="check"
            label={"Gruppe erstellen"}
            onPress={onCreateChatPressed}
            type={"primary"}
          ></SimpleButton>
        </View>
      ) : undefined}

      {/* Slider to switch between creating a group chat or single chat */}
      <View style={[styles["slider-view"]]}>
        <ThemedSlider
          onPressCallBack={onThemedSliderPress}
          options={[
            APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_SLIDER_OPTION_1,
            APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_SLIDER_OPTION_2,
          ]}
          currentOption={currentTab}
        ></ThemedSlider>
      </View>

      {/* Following is based on the slider position */}
      {currentTab == 0 ? (
        <ScrollView
          contentContainerStyle={{
            gap: 40,
            paddingBottom: 150,
          }}
          style={[styles["scroll-container"]]}
        >
          {/* For creating a group avatar */}

          <View style={styles["avatar-wrapper"]}>
            <ProfilePic
              onPress={onAvatarPressed}
              source={avatarSource}
              avatarType="group"
              showBorder={false}
              size="extra-large"
            ></ProfilePic>
          </View>

          {/* Container for the text field where the user can add the group name */}

          <View>
            <ThemedTextField
              type="big"
              placeholder="Gruppenname"
            ></ThemedTextField>
            <ThemedText
              style={styles["text-field-description"]}
              color={neutral600Color}
              type="caption"
            >
              {APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_GROUP_NAME_INFO}
            </ThemedText>
          </View>

          {/* Container for the text field where the user can add the group description */}

          <View>
            <ThemedTextField
              type="normal"
              placeholder="Gruppenbeschreibung"
            ></ThemedTextField>
            <ThemedText
              style={styles["text-field-description"]}
              color={neutral600Color}
              type="caption"
            >
              {APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_GROUP_DESCRIPTION_INFO}
            </ThemedText>
          </View>

          {/* Bento box for showing classes and adding additional ones */}

          <ThemedBentoBox label="Hinzugefügte Klassen">
            {MOCK_CLASSES.map((props) => (
              <View key={props.userId}>
                <ThemedListPreviewItem
                  {...props}
                  showRemoveButton
                  backgroundColor="transparent"
                  paddingVertical={10}
                ></ThemedListPreviewItem>
                <ThemedDivider></ThemedDivider>
              </View>
            ))}
            <View style={styles["add-additional-button-container"]}>
              <SmallButton
                type="normal"
                iconName="plus"
                label="Weitere Klasse hinzufügen"
              ></SmallButton>
            </View>
          </ThemedBentoBox>

          {/* Bento Box for showing group members and adding additional ones */}
          <ThemedBentoBox label="Gruppenmitglieder">
            {MOCK_USERS.map((props) => (
              <View key={props.userId}>
                <ThemedListPreviewItem
                  {...props}
                  showRemoveButton
                  backgroundColor="transparent"
                  paddingVertical={10}
                ></ThemedListPreviewItem>
                <ThemedDivider></ThemedDivider>
              </View>
            ))}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <View style={styles["add-additional-button-container"]}>
                <SmallButton
                  type="normal"
                  onPress={onAddUserPressed}
                  iconName="plus"
                  label="Weitere Benutzer hinzufügen"
                ></SmallButton>
              </View>
            </View>
          </ThemedBentoBox>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            gap: 10,
            paddingTop: 40,
          }}
          style={styles.chatScrollView}
        >
          {MOCK_USERS.map((props, key) => {
            return (
              <ThemedPressable disabled onPress={() => {}}>
                <ThemedListPreviewItem
                  borderRadius={18}
                  key={key}
                  backgroundColor={chatPreviewBackgroundColor}
                  paddingVertical={15}
                  paddingHorizontal={15}
                  {...props}
                />
              </ThemedPressable>
            );
          })}
        </ScrollView>
      )}
    </ThemedModal>
  );
};

const styles = StyleSheet.create({
  "slider-view": {
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  "scroll-container": {
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  "add-additional-button-container": {
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  "finish-button": {
    position: "absolute",
    bottom: 30,
    left: 15,
    right: 15,
    zIndex: 999,
  },
  "text-field-description": {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  "avatar-wrapper": {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 30,
  },
  chatScrollView: {
    paddingHorizontal: 15,
  },
});

export default ThemedCreateChatModal;
