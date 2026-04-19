import IcomoonIcon from "@/components/IcomoonIcon";
import SimpleButton from "@/components/buttons/simple-button";
import SmallButton from "@/components/buttons/small-button";
import { ThemedText } from "@/components/themed-text";
import ThemedTextField from "@/components/themed-text-field";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UsernamePage = () => {
  const [text, setText] = useState("");
  const [inputError, setInputError] = useState("");
  const [isValid, setIsValid] = useState(true);

  const router = useRouter();
  const errorColor = useThemeColor({}, "red-500");
  const neutral900Color = useThemeColor({}, "neutral-900");
  const neutral100Color = useThemeColor({}, "neutral-100");

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = (input: string) => {
    if (input.length < 1) {
      setIsValid(false);
      setInputError("Du hast nichts in das Feld eingegeben");
      return false;
    } else {
      router.push(`/(auth)/password-page/${text}`);
    }
  };

  const handleInputChange = (input: string) => {
    if (input.includes(" ")) {
      const withoutSpaces = input.replace(/\s/g, "");
      setText(withoutSpaces);
    } else {
      setText(input);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: useThemeColor({}, "neutral-50") }}
    >
      <Stack.Screen
        options={{
          title: "",
          headerShown: true,
          headerTransparent: true,
          headerLeft: () => (
            <SmallButton
              onPress={handleBackButtonPress}
              label="Zurück"
              iconName="arrow-left"
            ></SmallButton>
          ),
        }}
      ></Stack.Screen>
      <View style={styles["main-container"]}>
        <View style={styles["heading-container"]}>
          <IcomoonIcon
            size={62}
            name="user-focus"
            color={neutral900Color}
          ></IcomoonIcon>
          <ThemedText
            color={neutral900Color}
            type="heading2"
            style={{ textAlign: "center" }}
          >
            Wer bist du?
          </ThemedText>
          <ThemedText
            color={neutral900Color}
            type="body"
            style={{ textAlign: "center" }}
          >
            Benutzernamen oder Mail eingeben
          </ThemedText>
        </View>
        <ThemedTextField
          placeholder="Benutzername oder E-Mail"
          value={text}
          onChangeText={handleInputChange}
          heightBased={60}
          autoFocus
        ></ThemedTextField>
        {!isValid && (
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
            }}
          >
            <IcomoonIcon
              name="x-circle"
              size={15}
              color={errorColor}
            ></IcomoonIcon>
            <ThemedText color={errorColor} type="caption">
              {inputError}
            </ThemedText>
          </View>
        )}
        <SimpleButton
          onPress={() => handleContinueButtonPress(text)}
          label="Weiter"
          type="primary"
          icomoonIcon="arrow-right"
        ></SimpleButton>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  "heading-container": {
    gap: 10,
    alignItems: "center",
  },
  "main-container": {
    paddingTop: 70,
    paddingHorizontal: 15,
    width: "100%",
    gap: 20,
  },
  "input-field": {
    padding: 15,
    fontFamily: "MartianGrotesk-StdRg",
    fontSize: 14,
    height: 60,
    borderRadius: 16,
  },
});

export default UsernamePage;
