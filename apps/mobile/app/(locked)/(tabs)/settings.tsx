import ThemedProfilePreview from "@/components/pages/settings/themed-profile-preview";
import ThemedSettingsItem, {
  ThemedSettingsItemProp,
} from "@/components/pages/settings/themed-settings-item";
import ThemedDivider from "@/components/themed-divider";
import ThemedHeader from "@/components/themed-header";
import ThemedPressable from "@/components/themed-pressable";
import ThemedSearchBar from "@/components/themed-search-bar";
import { useSession } from "@/context/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const settingsItems: ThemedSettingsItemProp[] = [
  {
    label: "Dark Mode",
    icomoonIcon: "moon-stars",
    type: "switch",
    onPressAction: "dark-mode-press-action",
  },
  {
    label: "Benachrichtigungen",
    icomoonIcon: "bell",
    type: "switch",
    onPressAction: "notification-press-action",
  },
  {
    label: "Über die App",
    icomoonIcon: "info",
    type: "link",
    onPressAction: "about-press-action",
  },
  {
    label: "Hilfe erhalten",
    icomoonIcon: "lifebuoy",
    type: "link",
    onPressAction: "show-help-press-action",
  },
  {
    label: "Log Out",
    icomoonIcon: "sign-out",
    type: "link",
    onPressAction: "log-out-press-action",
  },
];

const Settings = () => {
  const neutral50Color = useThemeColor({}, "neutral-50");

  const [searchBarValue, setSearchBarValue] = useState("");
  const { signOut } = useSession();
  const router = useRouter();

  const onLogOutPressed = () => {
    console.log("from settings page: user clicked log out");
    signOut();
    router.dismissTo("/");
  };

  const onDarkModePressed = () => {
    console.log("From Settings Page: Dark mode trigger pressed");
  };

  const defaultPressedAction = () => {
    console.log("From Settings Page: default action tapped");
  };

  const settingsActionHandler: Record<string, () => void> = {
    "log-out-press-action": onLogOutPressed,
    "dark-mode-press-action": onDarkModePressed,
    "show-help-press-action": defaultPressedAction,
    default: defaultPressedAction,
  };

  return (
    <View
      style={[
        styles["main-container"],
        {
          backgroundColor: neutral50Color,
        },
      ]}
    >
      <SafeAreaView>
        <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
        <ThemedHeader
          headerTitle={"Einstellungen"}
          headerSearchBar={
            <ThemedSearchBar
              placeholder="Nach Einstellung suchen.."
              value={searchBarValue}
              onInputChanged={setSearchBarValue}
            ></ThemedSearchBar>
          }
        ></ThemedHeader>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 50,
        }}
        style={styles["scroll-view"]}
      >
        <ThemedPressable onPress={() => {}}>
          <ThemedProfilePreview
            firstName="Maxine"
            lastName="Maxwell"
            username={"@mmaxwell"}
            badges={[
              {
                icomoonIconName: "student",
                label: "Schüler",
              },
              {
                icomoonIconName: "graduation-cap",
                label: "9D",
              },
            ]}
          ></ThemedProfilePreview>
        </ThemedPressable>

        <ThemedDivider
          style={{ marginVertical: 20, marginHorizontal: 20 }}
        ></ThemedDivider>

        <View style={styles["settings-items-container"]}>
          {settingsItems.map((item, key) => (
            <ThemedPressable
              key={key}
              onPress={settingsActionHandler[item.onPressAction ?? "default"]}
            >
              <ThemedSettingsItem {...item}></ThemedSettingsItem>
            </ThemedPressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  "main-container": {
    flex: 1,
  },
  "scroll-view": {
    paddingHorizontal: 15,
  },
  "settings-items-container": {
    gap: 10,
  },
});

export default Settings;
