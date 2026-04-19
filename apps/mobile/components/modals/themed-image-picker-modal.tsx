import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View } from "react-native";
import ProfilePic from "../profile-pic";
import ThemedGridView from "../themed-grid-view";
import ThemedModal from "./themed-modal";

const ITEM_WIDTH = 110;
const GAP = 10;

export const IMAGE_URIS = [
  "https://i.ibb.co/7JspsbLL/Bio.png",
  "https://i.ibb.co/m5K8cScv/Chemie.png",
  "https://i.ibb.co/L2Ly7WP/Cornwell.png",
  "https://i.ibb.co/0j0fDB9Q/Deutsch.png",
  "https://i.ibb.co/7dNsQNrT/Physik.png",
  "https://i.ibb.co/MD0qBR37/SMV.png",
  "https://i.ibb.co/ccjQ8xrv/Sport.png",
];

export type ThemedImagePickerModalProps = {
  images: string[];
  onCallBack: (image: string | undefined) => void;
  onRequestClose: () => void;
  visible: boolean;
};

const ThemedImagePickerModal = (props: ThemedImagePickerModalProps) => {
  const profilePicArray: React.ReactNode[] = [
    ...IMAGE_URIS.map((uri) => (
      <ProfilePic
        onPress={() => onAvatarPressed(uri)}
        avatarType="group"
        size="large"
        source={uri}
      ></ProfilePic>
    )),
    <ProfilePic
      onPress={() => onAvatarPressed(undefined)}
      avatarType="group"
      size="large"
      source={undefined}
      icomoonIcon="prohibit"
    ></ProfilePic>,
  ];

  const onAvatarPressed = (uri: string | undefined) => {
    props.onCallBack(uri);
    props.onRequestClose();
  };

  const backgroundColor = useThemeColor({}, "neutral-100");

  return (
    <ThemedModal visible={props.visible} onRequestClose={props.onRequestClose}>
      <View style={[{ backgroundColor }, styles.main]}>
        {<ThemedGridView items={profilePicArray} itemWidth={100} />}
      </View>
    </ThemedModal>
  );
};

const styles = StyleSheet.create({
  main: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
});

export default ThemedImagePickerModal;
