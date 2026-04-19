import IcomoonIcon from "@/components/IcomoonIcon";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = 75;

export default function TabLayout() {
  const primary100Color = useThemeColor({}, "primary-100");
  const primary900Color = useThemeColor({}, "primary-900");
  const neutral50Color = useThemeColor({}, "neutral-50");
  const neutral900Color = useThemeColor({}, "neutral-900");
  const tabBarIconSize = 25;

  const safeAreBottomInsets = useSafeAreaInsets().bottom;
  let tabBarHeight;

  // Increase the bottom margin of the tab bar for devices with round screen corners
  if (safeAreBottomInsets > 0) {
    tabBarHeight = TAB_BAR_HEIGHT + 30;
  } else {
    tabBarHeight = TAB_BAR_HEIGHT;
  }

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarActiveTintColor: primary900Color,
        tabBarInactiveTintColor: neutral900Color,
        tabBarIconStyle: {
          alignItems: "center",
          height: 40,
        },
        tabBarStyle: {
          height: tabBarHeight,
          borderTopWidth: 1.5,
          borderTopColor: neutral900Color,
          backgroundColor: neutral50Color,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="chats"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText color={color} type="caption" numberOfLines={1}>
              Chats
            </ThemedText>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? primary100Color : "transparent",
                width: 60,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <IcomoonIcon
                color={color}
                name="chat-circle"
                size={tabBarIconSize}
              ></IcomoonIcon>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText color={color} type="caption" numberOfLines={1}>
              Entdecken
            </ThemedText>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? primary100Color : "transparent",
                width: 60,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <IcomoonIcon
                color={color}
                name="binoculars"
                size={tabBarIconSize}
              ></IcomoonIcon>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="blackboards"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText color={color} type="caption" numberOfLines={1}>
              Blackboards
            </ThemedText>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? primary100Color : "transparent",
                width: 60,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <IcomoonIcon
                color={color}
                name="megaphone-simple"
                size={tabBarIconSize}
              ></IcomoonIcon>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: ({ color }) => (
            <ThemedText color={color} type="caption" numberOfLines={1}>
              Einstellungen
            </ThemedText>
          ),
          tabBarIcon: ({ focused, color }) => (
            <View
              style={{
                backgroundColor: focused ? primary100Color : "transparent",
                width: 60,
                height: 30,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <IcomoonIcon
                color={color}
                name="wrench"
                size={tabBarIconSize}
              ></IcomoonIcon>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
