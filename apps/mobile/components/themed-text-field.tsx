import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "./themed-text";

type ThemedTextFieldProps = React.ComponentProps<typeof TextInput> & {
  fieldDescription?: string;
  obscureText?: boolean;
  isEditable?: boolean;
  heightBased?: number;
  ref?: React.Ref<TextInput> | undefined;
  type?: "normal" | "big";
};

const ThemedTextField = ({
  type = "normal",
  obscureText,
  isEditable = true,
  fieldDescription,
  ref,
  ...props
}: ThemedTextFieldProps) => {
  const neutral200Color = useThemeColor({}, "neutral-200");
  const neutral900Color = useThemeColor({}, "neutral-900");
  const neutral500Color = useThemeColor({}, "neutral-500");

  return (
    <View
      style={[
        styles["container"],
        {
          backgroundColor: neutral200Color,
          paddingVertical: props.heightBased != null ? 0 : 15,
          height: props.heightBased,
          gap: 10,
        },
      ]}
    >
      {fieldDescription && (
        <ThemedText color={neutral900Color} type="caption">
          {fieldDescription}
        </ThemedText>
      )}
      <TextInput
        ref={ref}
        editable={isEditable}
        secureTextEntry={obscureText}
        autoCapitalize="none"
        placeholderTextColor={neutral500Color}
        style={[
          type == "normal"
            ? styles["normal-text-style"]
            : styles["big-text-style"],
          {
            color: neutral900Color,
          },
        ]}
        {...props}
      ></TextInput>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    borderRadius: 16,
    justifyContent: "center",
  },
  "text-field": {
    backgroundColor: "transparent",
  },
  "normal-text-style": {
    fontSize: 14,
    padding: 0,
    lineHeight: 17.3,
    fontFamily: "MartianGrotesk-StdRg",
  },
  "big-text-style": {
    fontFamily: "MartianGrotesk-NrBl",
    fontSize: 36.65,
    lineHeight: 40.3,
    letterSpacing: -0.2,
    padding: 0,
  },
});

export default ThemedTextField;
