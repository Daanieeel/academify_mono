import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { View } from 'react-native'

import IcomoonIcon from '@/components/IcomoonIcon'
import { ThemedText } from '@/components/themed-text'
import ThemedToggle from '@/components/themed-toggle'


export type ThemedSettingsItemProp = {
    label: string,
    icomoonIcon: string,
    type: 'switch' | 'link',
    onPressAction?: string,
    isActive?: boolean,
    onValueChange?: () => void,
}

const ThemedSettingsItem = ({ ...props }: ThemedSettingsItemProp) => {

    const neutral100Color = useThemeColor({}, 'neutral-100')
    const neutral900Color = useThemeColor({}, 'neutral-900')
    const primary300Color = useThemeColor({}, 'primary-300')

    return (
        <View style={{
            backgroundColor: neutral100Color,
            width: '100%',
            height: 68,
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            alignItems: 'center',
            flexDirection: 'row',
            borderRadius: 18
        }}>
            <View style={{
                gap: 15,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                <IcomoonIcon size={24} color={neutral900Color} name={props.icomoonIcon}></IcomoonIcon>
                <ThemedText type='body' color={neutral900Color}>{props.label}</ThemedText>
            </View>
            {
                props.type == 'link' ?
                    (<View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        backgroundColor: primary300Color,
                        borderRadius: 6
                    }}>
                        <IcomoonIcon size={20} color={neutral900Color} name='arrow-right'></IcomoonIcon>
                    </View>)
                    :
                    (<ThemedToggle
                        isActive={props.isActive}
                        onValueChange={() => {
                            if (props.onValueChange != null) {
                                props.onValueChange()
                            }
                        }} >
                    </ThemedToggle>)
            }
        </View>
    )
}



export default ThemedSettingsItem