import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import ThemedSearchBar from '../../themed-search-bar';
import ThemedModal from '../themed-modal';
import ThemedListPreviewItem, {
  ThemedListPreviewItemProps,
} from './themed-list-preview-item';
import ThemedSelectable from './themed-selectable';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

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
  { heading: 'Felix Neumann', userId: 14, caption: 'Klasse: 9c' },
];

type ThemedPickerModalProps = {
  title?: string;
  items?: React.ReactNode[];
  onFinished?: (selectedIndizes: number[]) => void;
  visible: boolean;
  onRequestClose: () => void;
};

const ThemedPickerModal = (props: ThemedPickerModalProps) => {
  const [selectedIDs, setSelectedIDs] = useState<(number | string)[]>([]);

  const toggleItem = (itemId: number | string) => {
    setSelectedIDs((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((i) => i !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const onFinishPressed = () => {
    props.onRequestClose();
  };

  const onAbortPressed = () => {
    props.onRequestClose();
  };

  return (
    <ThemedModal visible={props.visible} onRequestClose={props.onRequestClose}>
      {/* Header View including finished button and title as well as the modal dismiss indicator */}
      <View className="flex-row gap-[5px] px-[15px] pb-[10px] pt-[10px]">
        <View
          style={{
            flex: 1,
          }}
        >
          <ThemedSearchBar
            placeholder={'Nach Benutzern suchen'}
            value={''}
            onInputChanged={() => {}}
          ></ThemedSearchBar>
        </View>

        <Button variant="normal" onPress={onAbortPressed}>
          <Icon name="x-circle" size={25} />
        </Button>
      </View>

      <View className="absolute bottom-[100px] left-[10px] z-[9999] rounded-[18px] bg-neutral-200 p-[10px]">
        <Text className="text-neutral-600" variant="caption">
          {selectedIDs.length + '/200'}
        </Text>
      </View>

      <View className="absolute bottom-[30px] left-[15px] right-[15px] z-[9999]">
        <Button variant="primary" size="lg" onPress={onFinishPressed}>
          <Text>Fertig</Text>
          <Icon name="check" size={24} />
        </Button>
      </View>

      <FlatList
        ItemSeparatorComponent={() => <View style={{ height: 8 }}></View>}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 150,
        }}
        className="z-[1] pt-[10px]"
        data={MOCK_USERS}
        renderItem={(item) => {
          const isSelected = selectedIDs.includes(item.item.userId);
          return (
            <ThemedSelectable
              selected={isSelected}
              onPress={() => toggleItem(item.item.userId)}
            >
              <ThemedListPreviewItem
                paddingHorizontal={15}
                className="bg-neutral-50"
                {...item.item}
              ></ThemedListPreviewItem>
            </ThemedSelectable>
          );
        }}
      ></FlatList>
    </ThemedModal>
  );
};

export default ThemedPickerModal;
