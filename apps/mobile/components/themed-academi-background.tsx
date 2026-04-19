import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { View } from "react-native";
import { ThemedText } from "./themed-text";

const ThemedAcademiBackground = () => {
  const neutral200Color = useThemeColor({}, "neutral-200");

  return (
    <View
      style={{
        position: "absolute",
        top: -100,
        right: -100,
        zIndex: 0,
        gap: 25,
        transform: [{ rotate: "-15deg" }],
      }}
    >
      {Array.from({ length: 30 }).map((_, index) => (
        <View key={index} style={{ flexDirection: "row", gap: 25 }}>
          {Array.from({ length: 30 }).map((_, innerIndex) => (
            <ThemedText
              key={innerIndex}
              color={neutral200Color}
              type="heading2"
            >
              academi
            </ThemedText>
          ))}
        </View>
      ))}
    </View>
  );
};

export default ThemedAcademiBackground;
