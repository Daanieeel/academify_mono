import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";

export type ThemedAttachementButtonProps = {
  label: string;
  emojiPath: ImageSourcePropType;
};

const ThemedAttachmentButton = (props: ThemedAttachementButtonProps) => {
  const neutral200Color = useThemeColor({}, "neutral-200");

  return (
    <View
      style={[
        {
          backgroundColor: neutral200Color,
        },
        styles["main-container"],
      ]}
    >
      <Image source={props.emojiPath} style={styles["emoji"]}></Image>
      <ThemedText type="caption">{props.label}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  "main-container": {
    borderRadius: 9999,
    paddingHorizontal: 12,
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emoji: {
    height: 20,
    width: 20,
    objectFit: "contain",
  },
});

export default ThemedAttachmentButton;
