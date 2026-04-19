import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import IcomoonIcon from '../IcomoonIcon';
import { ThemedText } from '../themed-text';

type SmallButtonProps = {
    onPress?: () => void;
    label?: string;
    iconName?: string;
    iconSize?: number;
    customPaddingHorizontal?: number,
    customPaddingVertical?: number,
    type?: 'normal' | 'inverted' | 'dotted' | 'red'
    disabled?: boolean
}

const SmallButton = ({ iconName, disabled = false, type = 'normal', ...props }: SmallButtonProps) => {

    var backgroundColor;
    var foregroundColor;
    var borderWidth;

    const borderColor = useThemeColor({}, 'neutral-400')

    switch (type) {
        case 'normal':
            foregroundColor = useThemeColor({}, 'neutral-900')
            backgroundColor = useThemeColor({}, 'neutral-200')
            borderWidth = 0
            break;
        case 'inverted':
            foregroundColor = useThemeColor({}, 'neutral-100')
            backgroundColor = useThemeColor({}, 'neutral-900')
            borderWidth = 0
            break;
        case 'dotted':
            foregroundColor = useThemeColor({}, 'neutral-900')
            backgroundColor = 'transparent'
            borderWidth = 2
            break;
        case 'red':
            foregroundColor = useThemeColor({}, 'neutral-50')
            backgroundColor = useThemeColor({}, 'red-600')
            borderWidth = 0
    }

    return (
        <TouchableOpacity
            activeOpacity={.7}
            onPress={props.onPress}
            style={[
                styles['main-container'],
                {
                    paddingHorizontal: props.customPaddingHorizontal ?? 20,
                    paddingVertical: props.customPaddingVertical ?? 10,
                    borderColor,
                    borderWidth,
                    backgroundColor: backgroundColor,
                    opacity: disabled ? .5 : 1,
                }
            ]}>
            {iconName && <IcomoonIcon size={props.iconSize ?? 18} name={iconName} color={foregroundColor}></IcomoonIcon>}
            {props.label && <ThemedText color={foregroundColor} type='body'>{props.label}</ThemedText>}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    'main-container': {
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    }
})

export default SmallButton