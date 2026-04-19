import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import IcomoonIcon from './IcomoonIcon'
import { ThemedText } from './themed-text'

type ThemedErrorBackgroundProps = {
    title: string,
    description?: string,
    iconName?: string

}

const ThemedErrorBackground = ({ iconName = 'smiley-x-eyes', ...props }: ThemedErrorBackgroundProps) => {

    const neutral800Color = useThemeColor({}, 'neutral-800')
    const neutral600Color = useThemeColor({}, 'neutral-800')

    return (
        <View style={[
            styles['main-container'],
            {
                borderColor: neutral600Color
            }
        ]}>
            <IcomoonIcon color={neutral800Color} size={50} name={iconName}></IcomoonIcon>
            <ThemedText style={{ textAlign: 'center' }} color={neutral800Color} type='subHeading'>
                {props.title}
            </ThemedText>
            <ThemedText style={{ textAlign: 'center' }} color={neutral600Color} type='caption'>
                {props.description}
            </ThemedText>
        </View>
    )
}

const styles = StyleSheet.create({
    'main-container': {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderStyle: 'dashed',
        padding: 20,
        borderRadius: 18,
        gap: 5,
        maxWidth: '60%',
        alignItems: 'center'
    }
})

export default ThemedErrorBackground