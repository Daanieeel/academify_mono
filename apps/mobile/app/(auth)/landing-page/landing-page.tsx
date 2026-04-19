import SimpleButton from "@/components/buttons/simple-button";
import LandingPageSpeachBubble from "@/components/pages/landing-page/landing-page-speach-bubble";
import APPLICATION_CONSTANTS from "@/constants/strings";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LandingPage = () => {
  const handleLoginButtonPress = () => {
    console.warn("Login button pressed");
    router.push("/(auth)/username-page/");
  };

  const handleUntisLoginButtonPress = () => {};

  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
      <View style={{ flex: 1, flexDirection: "column", padding: 15 }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexShrink: 1, zIndex: 1 }} className="w-100vw">
            <LandingPageSpeachBubble
              style={{ maxWidth: "65%", transform: [{ rotate: "352deg" }] }}
              type="inverted"
              content={APPLICATION_CONSTANTS.LANDING_BUBBLE_1}
            ></LandingPageSpeachBubble>
          </View>
          <View
            style={{ flexShrink: 1 }}
            className="w-100vw display-flex items-end"
          >
            <LandingPageSpeachBubble
              style={{ maxWidth: "75%", transform: [{ rotate: "4deg" }] }}
              type="normal"
              content={APPLICATION_CONSTANTS.LANDING_BUBBLE_2}
            ></LandingPageSpeachBubble>
          </View>
          <View style={styles.imageView}>
            <Image
              style={styles.image}
              source={require("@/assets/images/app/wild-boar.png")}
            ></Image>
          </View>
        </View>
        <View style={{ flexShrink: 1, gap: 10 }}>
          <SimpleButton
            label={APPLICATION_CONSTANTS.LANDING_BUTTON_1}
            type="primary"
            icomoonIcon="arrow-right"
            onPress={handleLoginButtonPress}
          ></SimpleButton>
          <SimpleButton
            dynamicIconLeft={() => (
              <Image
                style={styles.untisIcon}
                source={require("@/assets/images/app/untis-3x.png")}
              />
            )}
            label={APPLICATION_CONSTANTS.LANDING_BUTTON_2}
            type="secondary"
            customTextColor={useThemeColor({}, "untis-orange")}
            onPress={handleUntisLoginButtonPress}
          ></SimpleButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Style Sheet for additional styles (object-contain not implemented in nativewind)
const styles = StyleSheet.create({
  imageView: {
    flex: 1,
  },
  image: {
    flex: 1,
    height: "100%",
    width: "50%",
    resizeMode: "contain",
  },
  untisIcon: {
    height: 26,
    width: 26,
  },
});

export default LandingPage;
