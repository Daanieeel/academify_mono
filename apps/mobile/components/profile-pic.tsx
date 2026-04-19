import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import IcomoonIcon from "./IcomoonIcon";
import ThemedPressable from "./themed-pressable";

export type ProfilePicProps = {
  size: "small" | "medium" | "large" | "extra-large";
  source?: string;
  customBorderColor?: string;
  onPress?: () => void;
  icomoonIcon?: string;
  showBorder?: boolean;
  avatarType?: "person" | "group";
};

const ProfilePic = ({
  size = "small",
  avatarType = "person",
  source,
  showBorder = true,
  ...props
}: ProfilePicProps) => {
  let avatarSize;
  let icomoonIcon;

  const avatarIconColor = useThemeColor({}, "neutral-700");
  const avatarBackgroundColor = useThemeColor({}, "neutral-200");
  const [modalShown, setModalShown] = useState(false);

  const borderColor = showBorder
    ? (props.customBorderColor ?? useThemeColor({}, "neutral-100"))
    : "transparent";
  const borderRadius = avatarType == "person" ? 9999 : 40;

  const onPress = () => {
    props.onPress && props.onPress();
  };

  switch (avatarType) {
    case "person":
      icomoonIcon = "user";
      break;
    case "group":
      icomoonIcon = "users-three";
      break;
    default:
      icomoonIcon = "question-mark";
  }

  if (props.icomoonIcon != null) {
    icomoonIcon = props.icomoonIcon;
  }

  switch (size) {
    case "small":
      avatarSize = 45;
      break;
    case "medium":
      avatarSize = 60;
      break;
    case "large":
      avatarSize = 110;
      break;
    case "extra-large":
      avatarSize = 150;
  }

  return (
    <ThemedPressable animationEnabled={props.onPress != null} onPress={onPress}>
      <View
        style={{
          overflow: "hidden",
          backgroundColor: avatarBackgroundColor,
          alignItems: "center",
          justifyContent: "center",
          borderRadius,
          height: avatarSize,
          width: avatarSize,
          borderWidth: 4,
          borderColor: borderColor,
        }}
      >
        {source && (
          <Image
            height={avatarSize}
            width={avatarSize}
            source={{ uri: source }}
          ></Image>
        )}
        {source == null ? (
          <IcomoonIcon
            color={avatarIconColor}
            size={avatarSize / 2}
            name={icomoonIcon}
          ></IcomoonIcon>
        ) : undefined}
      </View>
    </ThemedPressable>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 9999,
    aspectRatio: 1,
    borderWidth: 4,
  },
});

export default ProfilePic;
