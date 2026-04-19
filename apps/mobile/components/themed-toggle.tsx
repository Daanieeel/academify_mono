import { useThemeColor } from '@/hooks/use-theme-color'
import React, { useState } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { ThemedText } from './themed-text'

type ThemedToggleProps = {
    labelActive?: string,
    labelInactive?: string,
    onValueChange: () => void,
    isActive?: boolean
}

const TOGGLE_WIDTH = 71
const DURATION = 50
const THUMB_WIDTH = 45
const EASING = Easing.bezier(0.4, 0, 0.2, 1)

const ThemedToggle = ({ labelActive = 'an', labelInactive = 'aus', onValueChange, ...props }: ThemedToggleProps) => {

    const primary900Color = useThemeColor({}, 'primary-900')
    const primary100Color = useThemeColor({}, 'primary-100')

    const [isActive, setIsActive] = useState(props.isActive ?? 'false')
    const progress = useSharedValue(isActive ? 1 : 0)

    const onPress = () => {
        const next = !isActive
        setIsActive(next)
        progress.value = withTiming(next ? 1 : 0, { duration: DURATION, easing: EASING })
        onValueChange();
    }

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', primary900Color]),
        borderColor: interpolateColor(
            progress.value,
            [0, 1],
            [primary900Color, 'transparent']),
    }))

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const maxTranslate = TOGGLE_WIDTH - THUMB_WIDTH - 6;
        return {
            transform: [
                {
                    translateX: withTiming(progress.value * maxTranslate, { duration: DURATION + 150, easing: EASING })
                }
            ],
            backgroundColor: interpolateColor(
                progress.value,
                [0, 1],
                [primary900Color, primary100Color]),
        }
    })

    return (
        <Animated.View
            onTouchEndCapture={onPress}
            style={[
                styles['main-container'],
                containerAnimatedStyle,
                {
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                }]}>
            <Animated.View
                style={[
                    styles['thumb'],
                    thumbAnimatedStyle,
                ]}>
                <ThemedText type='caption' color={isActive ? primary900Color : primary100Color}>
                    {isActive ? labelActive : labelInactive}
                </ThemedText>
            </Animated.View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    'main-container': {
        paddingVertical: 1.5,
        paddingHorizontal: 1.5,
        width: TOGGLE_WIDTH,
        height: 28,
        borderRadius: 9999
    },
    'thumb': {
        width: THUMB_WIDTH,
        borderRadius: 9999,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-start',
    }
})

export default ThemedToggle