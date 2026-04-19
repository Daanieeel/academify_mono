import { useHaptic } from "@/hooks/use-haptics";
import { useThemeColor } from "@/hooks/use-theme-color";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";

const THEMED_SLIDER_HEIGHT = 50;
const SLIDER_PADDING = 5;
const ANIMATION_DURATION = 200;

export type ThemedSliderProps = {
  options: string[];
  currentOption?: number;
  onPressCallBack: (index: number) => void;
};

const ThemedSlider = ({ currentOption = 0, ...props }: ThemedSliderProps) => {
  const sliderBackground = useThemeColor({}, "neutral-200");
  const selectedTextColor = useThemeColor({}, "neutral-900");
  const deselectedTextColor = useThemeColor({}, "neutral-600");
  const selectedOptionContainerBackground = useThemeColor({}, "neutral-50");

  const [containerWidth, setContainerWidth] = useState(0);

  const haptic = useHaptic("medium");

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const selectedContainerWidth = containerWidth / props.options.length;

  const translateX = useRef(
    new Animated.Value(selectedContainerWidth * currentOption),
  ).current;

  const onOptionPressed = (index: number) => {
    haptic && haptic();
    props.onPressCallBack(index);
  };

  useEffect(() => {
    const toValue = selectedContainerWidth * currentOption;

    Animated.timing(translateX, {
      toValue,
      useNativeDriver: true,
      duration: ANIMATION_DURATION,
      easing: Easing.linear,
    }).start();
  }, [currentOption]);

  return (
    <View
      onLayout={onLayout}
      style={[
        styles["main-view"],
        {
          backgroundColor: sliderBackground,
        },
      ]}
    >
      <Animated.View
        style={[
          [
            styles["selected-container"],
            {
              backgroundColor: selectedOptionContainerBackground,
              zIndex: 1,
              left: SLIDER_PADDING,
              width:
                selectedContainerWidth - SLIDER_PADDING * props.options.length,
              transform: [{ translateX }],
            },
          ],
        ]}
      ></Animated.View>
      {props.options.map((optionName, index) => (
        <Pressable
          style={[
            styles["option-container"],
            {
              backgroundColor: "transparent",
            },
          ]}
          key={index}
          onPress={() => onOptionPressed(index)}
        >
          <View key={index}>
            <ThemedText
              numberOfLines={1}
              color={
                index == currentOption ? selectedTextColor : deselectedTextColor
              }
              type="body"
            >
              {optionName}
            </ThemedText>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  "main-view": {
    height: THEMED_SLIDER_HEIGHT,
    padding: SLIDER_PADDING,
    borderRadius: 18,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  "option-container": {
    zIndex: 999,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  "selected-container": {
    height: "100%",
    position: "absolute",
    top: 5,
    borderRadius: 15,
    zIndex: 1,
  },
});

export default ThemedSlider;
