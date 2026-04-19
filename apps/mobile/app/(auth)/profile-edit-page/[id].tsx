import SimpleButton from "@/components/buttons/simple-button";
import SmallButton from "@/components/buttons/small-button";
import IcomoonIcon from "@/components/IcomoonIcon";
import ProfilePic from "@/components/profile-pic";
import { ThemedText } from "@/components/themed-text";
import ThemedTextField from "@/components/themed-text-field";
import APPLICATION_CONSTANTS from "@/constants/strings";
import { useSession } from "@/context/auth-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type ProfilePageInputFieldData = {
  id: number;
  description: string;
  value?: string;
  isEditable?: boolean;
};

const ProfileEditPage = () => {
  const inputData: ProfilePageInputFieldData[] = [
    {
      id: 1,
      description: "Name",
      value: "Mad Max",
    },
    {
      id: 2,
      description: "Benutzername",
      value: "@mmax",
    },
    {
      id: 3,
      description: "Schule",
      value: "Rotteck-Gymnasium Freiburg",
      isEditable: false,
    },
    {
      id: 4,
      description: "Klasse",
      value: "9d",
    },
    {
      id: 5,
      description: "Geburtsdatum",
      value: "16.06.2006",
    },
  ];

  const userName = useLocalSearchParams().id;
  const neutral400Color = useThemeColor({}, "neutral-400");
  const neutral900Color = useThemeColor({}, "neutral-900");

  const { signIn } = useSession();

  const [values, setValues] = useState<Record<string, string>>({
    "1": inputData[0].value ?? "",
    "2": inputData[1].value ?? "",
    "3": inputData[2].value ?? "",
    "4": inputData[3].value ?? "",
    "5": inputData[4].value ?? "",
  });

  const handleBackButtonPress = () => {
    router.back();
  };

  const handleContinueButtonPress = () => {
    signIn();
    router.replace("/(tabs)/chats");
  };

  const handleChange = (id: number, newValue: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  return (
    <View style={{ flex: 1 }}>
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
      <ScrollView style={styles["scroll-view"]}>
        <View style={styles["header-container"]}>
          <View style={styles["text-container"]}>
            <ThemedText
              style={{ width: "80%", textAlign: "center" }}
              type="heading2"
            >
              {APPLICATION_CONSTANTS.PROFILE_EDIT_PAGE_HEADING}
            </ThemedText>
            <ThemedText
              style={{ width: "80%", textAlign: "center" }}
              type="body"
            >
              {APPLICATION_CONSTANTS.PROFILE_EDIT_PAGE_SUBHEADING}
            </ThemedText>
          </View>
          <View style={styles["pic-icon-container"]}>
            <ProfilePic size={"large"}></ProfilePic>
            <View
              style={[styles["hairline"], { backgroundColor: neutral400Color }]}
            ></View>
            <IcomoonIcon
              name="sparkle"
              size={70}
              color={neutral900Color}
            ></IcomoonIcon>
          </View>
        </View>
        {inputData.map((inputField) => (
          <View key={inputField.id} style={[styles["text-field-wrapper"]]}>
            <ThemedTextField
              key={inputField.id}
              placeholder={inputField.value ?? "Hinzufügen"}
              fieldDescription={inputField.description}
              value={values[inputField.id] ?? ""}
              isEditable={inputField.isEditable}
              heightBased={65}
              onChangeText={(input) => handleChange(inputField.id, input)}
            ></ThemedTextField>
          </View>
        ))}
        <View style={styles["bottom-inset-container"]}></View>
      </ScrollView>
      <SafeAreaView style={styles["continue-button-wrapper"]}>
        <SimpleButton
          label={APPLICATION_CONSTANTS.GENERAL_NEXT_PAGE}
          onPress={handleContinueButtonPress}
          icomoonIcon="arrow-right"
          type={"primary"}
        ></SimpleButton>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  "header-container": {
    marginTop: 150,
    gap: 40,
    marginBottom: 50,
  },
  "pic-icon-container": {
    width: "100%",
    justifyContent: "center",
    flexDirection: "row",
    gap: 30,
    alignItems: "center",
  },
  "text-container": {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  hairline: {
    width: 2,
    height: 80,
  },
  "scroll-view": {
    gap: 20,
    paddingHorizontal: 15,
  },
  "text-field-wrapper": {
    paddingBottom: 10,
  },
  "bottom-inset-container": {
    height: 200,
  },
  "continue-button-wrapper": {
    left: 0,
    right: 0,
    position: "absolute",
    paddingHorizontal: 15,
    bottom: 20,
  },
});

export default ProfileEditPage;
