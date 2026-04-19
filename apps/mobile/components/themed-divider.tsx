import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { View, ViewStyle } from "react-native";

export type ThemedDividerProps = {
  props?: React.ComponentProps<typeof View>;
  style?: ViewStyle;
};

const ThemedDivider = (props: ThemedDividerProps) => {
  const dividerColor = useThemeColor({}, "neutral-100");

  return (
    <View
      {...props.props}
      style={[
        props.style,
        {
          backgroundColor: dividerColor,
          height: 1.5,
        },
      ]}
    ></View>
  );
};

export default ThemedDivider;
