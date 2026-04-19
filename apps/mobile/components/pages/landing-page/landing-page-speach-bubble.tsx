import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type LandingPageSpeachBubbleProps = {
  type: "normal" | "inverted";
  content: string;
  style?: StyleProp<ViewStyle>;
};

const LandingPageSpeachBubble = ({
  type = "normal",
  content,
  style,
}: LandingPageSpeachBubbleProps) => {
  const backgroundColor =
    type === "inverted"
      ? useThemeColor({}, "neutral-900")
      : useThemeColor({}, "neutral-200");
  const textColor =
    type === "inverted"
      ? useThemeColor({}, "neutral-200")
      : useThemeColor({}, "neutral-900");

  return (
    <View style={[styles["bubble"], { backgroundColor }, style]}>
      <ThemedText type="heading2" color={textColor}>
        {content}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 18,
    maxWidth: "70%",
    padding: 12,
  },
});

export default LandingPageSpeachBubble;
