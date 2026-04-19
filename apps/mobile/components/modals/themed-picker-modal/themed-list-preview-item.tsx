import SmallButton from "@/components/buttons/small-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { View } from "react-native";
import ProfilePic from "../../profile-pic";
import { ThemedText } from "../../themed-text";

export type ThemedListPreviewItemProps = {
  avatar?: React.ReactNode;
  userId: number;
  heading: string;
  caption?: string;
  showRemoveButton?: boolean;
  backgroundColor?: string;
  paddingVertical?: number;
  paddingHorizontal?: number;
  borderRadius?: number;
};

const ThemedListPreviewItem = ({
  showRemoveButton = false,
  ...props
}: ThemedListPreviewItemProps) => {
  const previewBackgroundColor = useThemeColor({}, "neutral-100");

  return (
    <View
      style={{
        backgroundColor: props.backgroundColor ?? previewBackgroundColor,
        paddingVertical: props.paddingVertical ?? 15,
        paddingHorizontal: props.paddingHorizontal,
        justifyContent: "space-between",
        borderRadius: props.borderRadius,
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <View
        style={{ flex: 1, gap: 20, alignItems: "center", flexDirection: "row" }}
      >
        <ProfilePic showBorder={false} size="small"></ProfilePic>
        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <ThemedText type="body">{props.heading}</ThemedText>
          <ThemedText type="body">{props.caption}</ThemedText>
        </View>
      </View>
      {showRemoveButton && (
        <SmallButton
          customPaddingHorizontal={5}
          customPaddingVertical={5}
          type="red"
          iconName="minus-circle"
        ></SmallButton>
      )}
    </View>
  );
};

export default ThemedListPreviewItem;
