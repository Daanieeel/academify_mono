import React, { useEffect, useState } from 'react';
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

type ThemedPickerModalProps = {
  title?: string;
  items: ThemedListPreviewItemProps[];
  initialSelectedIds?: (number | string)[];
  onFinished?: (selectedIds: (number | string)[]) => void;
  visible: boolean;
  onRequestClose: () => void;
};

const ThemedPickerModal = (props: ThemedPickerModalProps) => {
  const [selectedIDs, setSelectedIDs] = useState<(number | string)[]>(
    props.initialSelectedIds ?? [],
  );

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (props.visible) {
      setSelectedIDs(props.initialSelectedIds ?? []);
      setSearchQuery('');
    }
  }, [props.visible, props.initialSelectedIds]);

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
    props.onFinished?.(selectedIDs);
    props.onRequestClose();
  };

  const onClearSelectionPressed = () => {
    setSelectedIDs([]);
  };

  const filteredItems = props.items.filter(
    (item) =>
      item.heading.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      item.caption?.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

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
            placeholder={props.title ?? 'Suchen'}
            value={searchQuery}
            onInputChanged={setSearchQuery}
          ></ThemedSearchBar>
        </View>

        <Button
          variant="secondary"
          disabled={selectedIDs.length === 0}
          onPress={onClearSelectionPressed}
        >
          <Icon name="x-circle" size={25} />
        </Button>
      </View>

      <View className="absolute bottom-[100px] left-[10px] z-[9999] rounded-[18px] bg-neutral-200 p-[10px]">
        <Text className="text-neutral-600" variant="caption">
          {selectedIDs.length + '/200'}
        </Text>
      </View>

      <View className="absolute bottom-[30px] left-[15px] right-[15px] z-[9999]">
        <Button variant="default" size="lg" onPress={onFinishPressed}>
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
        data={filteredItems}
        renderItem={(item) => {
          const isSelected = selectedIDs.includes(item.item.userId);
          return (
            <ThemedSelectable
              selected={isSelected}
              onPress={() => toggleItem(item.item.userId)}
            >
              <ThemedListPreviewItem
                paddingHorizontal={15}
                paddingVertical={15}
                borderRadius={18}
                backgroundColor="#ffffff"
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
