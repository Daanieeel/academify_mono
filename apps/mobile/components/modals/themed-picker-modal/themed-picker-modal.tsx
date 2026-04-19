import { useThemeColor } from '@/hooks/use-theme-color'
import React, { useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import SimpleButton from '../../buttons/simple-button'
import SmallButton from '../../buttons/small-button'
import ThemedSearchBar from '../../themed-search-bar'
import { ThemedText } from '../../themed-text'
import ThemedModal from '../themed-modal'
import ThemedListPreviewItem, { ThemedListPreviewItemProps } from './themed-list-preview-item'
import ThemedSelectable from './themed-selectable'


const MOCK_USERS: ThemedListPreviewItemProps[] = [
    { heading: 'Maxine Maxwell', userId: 0, caption: 'Klasse: 9d' },
    { heading: 'Linus Bung', userId: 1, caption: 'Klasse: 9d' },
    { heading: 'Daniel Dopatka', userId: 2, caption: 'Klasse: 9d' },
    { heading: 'Sophie Keller', userId: 3, caption: 'Klasse: 9c' },
    { heading: 'Leon Fischer', userId: 4, caption: 'Klasse: 9c' },
    { heading: 'Emma Wagner', userId: 5, caption: 'Klasse: 9b' },
    { heading: 'Noah Becker', userId: 6, caption: 'Klasse: 9b' },
    { heading: 'Mia Hoffmann', userId: 7, caption: 'Klasse: 9a' },
    { heading: 'Paul Schneider', userId: 8, caption: 'Klasse: 9a' },
    { heading: 'Lena Schulz', userId: 9, caption: 'Klasse: 9d' },
    { heading: 'Jonas Braun', userId: 10, caption: 'Klasse: 9c' },
    { heading: 'Laura Krüger', userId: 11, caption: 'Klasse: 9b' },
    { heading: 'Tim Richter', userId: 12, caption: 'Klasse: 9a' },
    { heading: 'Hannah Wolf', userId: 13, caption: 'Klasse: 9d' },
    { heading: 'Felix Neumann', userId: 14, caption: 'Klasse: 9c' }
]

type ThemedPickerModalProps = {
    title?: string,
    items?: React.ReactNode[],
    onFinished?: (selectedIndizes: number[]) => void,
    visible: boolean,
    onRequestClose: () => void
}

const ThemedPickerModal = (props: ThemedPickerModalProps) => {

    const neutral200Color = useThemeColor({}, 'neutral-200')
    const neutral600Color = useThemeColor({}, 'neutral-600')

    const themedListPreviewItemBackgroundColor = useThemeColor({}, 'neutral-50')


    const [selectedIDs, setSelectedIDs] = useState<number[]>([])



    const toggleItem = (itemId: number) => {
        setSelectedIDs((prev) => {
            if (prev.includes(itemId)) {
                return prev.filter(i => i !== itemId)
            } else {
                return [...prev, itemId]
            }
        })
    }

    const onFinishPressed = () => {
        props.onRequestClose();
    }

    const onAbortPressed = () => {
        props.onRequestClose();
    }

    return (
        <ThemedModal
            visible={props.visible}
            onRequestClose={props.onRequestClose}>

            {/* Header View including finished button and title as well as the modal dismiss indicator */}
            <View style={styles['header-view']}>
                <View style={{
                    flex: 1
                }}>
                    <ThemedSearchBar placeholder={'Nach Benutzern suchen'} value={''} onInputChanged={function (input: string): void {
                        throw new Error('Function not implemented.')
                    }}></ThemedSearchBar>
                </View>

                <SmallButton
                    onPress={onAbortPressed}
                    type='normal'
                    iconName='x-circle'
                    iconSize={25}
                ></SmallButton>
            </View>

            <View style={[
                styles['counter'],
                {
                    backgroundColor: neutral200Color
                }]}>
                <ThemedText
                    color={neutral600Color}
                    type='caption'>
                    {selectedIDs.length + '/200'}
                </ThemedText>
            </View>

            <View style={styles['finish-button']}>
                <SimpleButton
                    label={'Fertig'}
                    icomoonIcon='check'
                    onPress={onFinishPressed}
                    type={'primary'}>
                </SimpleButton>
            </View>

            <FlatList
                ItemSeparatorComponent={() => <View style={{ height: 8 }}></View>}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 150,
                }}
                style={styles['flat-list']}
                data={MOCK_USERS}
                renderItem={
                    (item) => {
                        const isSelected = selectedIDs.includes(item.item.userId)
                        return (
                            <ThemedSelectable
                                selected={isSelected}
                                onPress={() => toggleItem(item.item.userId)}>
                                <ThemedListPreviewItem
                                    paddingHorizontal={15}
                                    backgroundColor={themedListPreviewItemBackgroundColor}
                                    {...item.item}>
                                </ThemedListPreviewItem>
                            </ThemedSelectable>
                        )
                    }
                }
            ></FlatList >
        </ThemedModal >
    )
}

const styles = StyleSheet.create({
    'header-view': {
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        paddingHorizontal: 15,
        gap: 5,
    },
    'finish-button': {
        position: 'absolute',
        zIndex: 9999,
        bottom: 30,
        right: 15,
        left: 15
    },
    'flat-list': {
        zIndex: 1,
        paddingTop: 10
    },
    'counter': {
        position: 'absolute',
        zIndex: 9999,
        bottom: 100,
        padding: 10,
        borderRadius: 18,
        left: 10
    }


})

export default ThemedPickerModal