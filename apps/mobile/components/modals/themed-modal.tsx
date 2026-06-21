import { Icon } from '@/components/ui/icon';
import ThemedPressable from '@/components/themed-pressable';
import React from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ThemedModalProps = {
  children?: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
};

const ThemedModal = (props: ThemedModalProps) => {
  return (
    <Modal
      visible={props.visible}
      onRequestClose={props.onRequestClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-neutral-100">
        <SafeAreaView edges={['top']} className="px-[15px] pt-[15px]">
          <View className="items-end">
            <ThemedPressable onPress={props.onRequestClose}>
              <View className="h-[36px] w-[36px] items-center justify-center rounded-full bg-neutral-200">
                <Icon name="x" size={20} className="text-neutral-900" />
              </View>
            </ThemedPressable>
          </View>
        </SafeAreaView>
        {props.children}
      </View>
    </Modal>
  );
};

export default ThemedModal;
