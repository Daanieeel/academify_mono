import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { LayoutChangeEvent, Modal, StyleSheet, View } from 'react-native';

type ThemedModalProps = {
  children?: React.ReactNode;
  visible: boolean;
  onRequestClose: () => void;
};

const ThemedModal = (props: ThemedModalProps) => {
  const modalDismisserColor = useThemeColor({}, 'neutral-300');
  const backgroundColor = useThemeColor({}, 'neutral-100');
  const [modalWidth, setModalWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setModalWidth(width);
  };

  return (
    <Modal
      backdropColor={backgroundColor}
      style={[
        styles['modal-style'],
        {
          backgroundColor,
        },
      ]}
      onRequestClose={props.onRequestClose}
      animationType="slide"
      visible={props.visible}
      presentationStyle="pageSheet"
    >
      <View onLayout={onLayout} style={styles['main-view']}>
        {/* Small modal dismiss indicator, iOS inspired */}
        <View
          style={[
            styles['dismisser'],
            {
              left: modalWidth / 2 - 25,
              backgroundColor: modalDismisserColor,
            },
          ]}
        ></View>

        {props.children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  'modal-style': {
    paddingHorizontal: 15,
    paddingTop: 30,
  },
  dismisser: {
    position: 'absolute',
    borderRadius: 999,
    top: 10,
    width: 50,
    height: 5,
  },
  'main-view': {
    flex: 1,
    paddingTop: 25,
  },
});

export default ThemedModal;
