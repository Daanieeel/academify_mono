
import IcomoonIcon from '@/components/IcomoonIcon'
import SimpleButton from '@/components/buttons/simple-button'
import SmallButton from '@/components/buttons/small-button'
import { ThemedText } from '@/components/themed-text'
import ThemedTextField from '@/components/themed-text-field'
import APPLICATION_CONSTANTS from '@/constants/strings'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const UsernamePage = () => {
    const [password, setPassword] = useState('');
    const [inputError, setInputError] = useState('');
    const [isValid, setIsValid] = useState(true);

    const router = useRouter();
    const errorColor = useThemeColor({}, 'red-500');
    const neutral900Color = useThemeColor({}, 'neutral-900');
    const neutral100Color = useThemeColor({}, 'neutral-100');
    const userId = useLocalSearchParams().id;




    const handleBackButtonPress = () => {
        router.back();
    }

    const handleValidatePassword = () => {
        if (password.length < 1) {
            setIsValid(false);
            setInputError('Du hast nichts in das Feld eingegeben');
            return false;
        } else {
            setIsValid(true);
            router.push(`/(auth)/user-card-page/${userId}`);
        }
    }

    const handleInputChange = (input: string) => {
        setPassword(input);
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: useThemeColor({}, 'neutral-50') }}>
            <Stack.Screen options={{ title: '', headerShown: true, headerTransparent: true, headerLeft: () => <SmallButton onPress={handleBackButtonPress} label="Zurück" iconName="arrow-left"></SmallButton> }}></Stack.Screen>
            <View style={styles['main-container']}>
                <View style={styles['heading-container']}>
                    <IcomoonIcon size={62} name="password" color={neutral900Color}></IcomoonIcon>
                    <ThemedText color={neutral900Color} type="heading2" style={{ textAlign: 'center' }}>{APPLICATION_CONSTANTS.PASSWORD_PAGE_HEADING}</ThemedText>
                    <ThemedText
                        color={neutral900Color} type="body" style={{ textAlign: 'center' }}>{APPLICATION_CONSTANTS.PASSWORD_PAGE_SUBHEADING + ' ' + userId + '?'}
                    </ThemedText>
                </View>
                <View style={styles['input-container']}>
                    <ThemedTextField
                        placeholder={APPLICATION_CONSTANTS.PASSWORD_PAGE_INPUT_PLACEHOLDER}
                        value={password}
                        onChangeText={handleInputChange}
                        obscureText={true}
                        heightBased={60}
                        autoFocus>
                    </ThemedTextField>
                    {!isValid &&
                        <View style={{ marginTop: 10, flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                            <IcomoonIcon name="x-circle" size={15} color={errorColor}></IcomoonIcon>
                            <ThemedText color={errorColor} type="caption">{inputError}</ThemedText>
                        </View>}
                </View>
                <View style={styles['buttons-container']}>
                    <SimpleButton onPress={handleValidatePassword} label="Weiter" type="primary" icomoonIcon="arrow-right"></SimpleButton>
                    <SimpleButton onPress={handleValidatePassword} label="Passwort vergessen?" type="secondary"></SimpleButton>
                </View>
            </View>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    'heading-container': {
        gap: 10,
        alignItems: 'center'
    },
    'main-container': {
        paddingTop: 70,
        paddingHorizontal: 15,
        width: '100%',
        gap: 30
    },
    'input-container': {
        gap: 5
    },
    'buttons-container': {
        gap: 10
    }

})

export default UsernamePage

