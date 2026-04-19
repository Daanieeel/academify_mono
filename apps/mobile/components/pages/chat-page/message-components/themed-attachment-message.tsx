import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

export type ThemedAttachmentMessageProps = {
  userIsSender?: boolean;
  attachmentName: string;
  attachmentSize: string;
  attachmentFileType: string;
};

export default function ThemedAttachmentMessage(
  props: ThemedAttachmentMessageProps,
) {
  const backgroundColor = props.userIsSender
    ? useThemeColor({}, "primary-100")
    : useThemeColor({}, "neutral-100");
  const textColor = props.userIsSender
    ? useThemeColor({}, "primary-900")
    : useThemeColor({}, "neutral-900");

  return (
    <View
      style={[
        styles["main-container"],
        {
          backgroundColor,
        },
      ]}
    >
      <Image
        style={{ height: 40, width: 40 }}
        source={require("@/assets/images/app/emojis/page-emoji.png")}
      ></Image>
      <View style={styles["text-container"]}>
        <ThemedText color={textColor} numberOfLines={1} type="body">
          {props.attachmentName}
        </ThemedText>
        <ThemedText color={textColor} numberOfLines={1} type="caption">
          {props.attachmentFileType + " • " + props.attachmentSize}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  "main-container": {
    borderRadius: 13,
    padding: 15,
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
  },
  "text-container": {
    flexDirection: "column",
    gap: 2,
    alignItems: "flex-start",
  },
});
