import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { TextInput, View } from 'react-native';
import IcomoonIcon from './IcomoonIcon';

export type ThemedSearchBarProps = {
    placeholder: string,
    value: string,
    onInputChanged: (input: string) => void;
}

const ThemedSearchBar = ({ placeholder, value, onInputChanged }: ThemedSearchBarProps) => {

    const neutral200Color = useThemeColor({}, 'neutral-200')
    const neutral600Color = useThemeColor({}, 'neutral-600')

    return (
        <View style={{
            backgroundColor: neutral200Color,
            borderRadius: 18,
            height: 45,
            width: '100%',
            flexDirection: 'row',
            paddingHorizontal: 15,
            alignItems: 'center',
            gap: 10
        }}>
            <IcomoonIcon
                size={25}
                name='binoculars'
                color={neutral600Color}>
            </IcomoonIcon>
            <TextInput
                numberOfLines={1}
                value={value}
                onChange={(input) => onInputChanged(input.nativeEvent.text)}
                placeholder={placeholder}
                placeholderTextColor={neutral600Color}
                style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    fontSize: 14,
                    fontFamily: "MartianGrotesk-StdRg",
                }}>
            </TextInput>
        </View>
    )
}

export default ThemedSearchBar