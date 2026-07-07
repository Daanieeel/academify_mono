import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ThemedGridView from '../themed-grid-view';
import ThemedModal from './themed-modal';
import { Avatar } from '@/components/ui/avatar';

export const IMAGE_URIS = [
  'https://i.ibb.co/7JspsbLL/Bio.png',
  'https://i.ibb.co/m5K8cScv/Chemie.png',
  'https://i.ibb.co/L2Ly7WP/Cornwell.png',
  'https://i.ibb.co/0j0fDB9Q/Deutsch.png',
  'https://i.ibb.co/7dNsQNrT/Physik.png',
  'https://i.ibb.co/MD0qBR37/SMV.png',
  'https://i.ibb.co/ccjQ8xrv/Sport.png',
];

export type ThemedImagePickerModalProps = {
  images: string[];
  onCallBack: (image: string | undefined) => void;
  onRequestClose: () => void;
  visible: boolean;
};

const ThemedImagePickerModal = (props: ThemedImagePickerModalProps) => {
  const profilePicArray: React.ReactNode[] = [
    ...IMAGE_URIS.map((uri) => (
      <Avatar
        key={uri}
        onPress={() => onAvatarPressed(uri)}
        variant="rounded"
        size="lg"
        source={uri}
      ></Avatar>
    )),
    <Avatar
      key="no-image"
      onPress={() => onAvatarPressed(undefined)}
      variant="rounded"
      size="lg"
      source={undefined}
      icomoonIcon="prohibit"
    ></Avatar>,
  ];

  const onAvatarPressed = (uri: string | undefined) => {
    props.onCallBack(uri);
    props.onRequestClose();
  };

  const backgroundColor = useThemeColor({}, 'neutral-100');

  return (
    <ThemedModal visible={props.visible} onRequestClose={props.onRequestClose}>
      <View style={[{ backgroundColor }, styles.main]}>
        {<ThemedGridView items={profilePicArray} itemWidth={100} />}
      </View>
    </ThemedModal>
  );
};

const styles = StyleSheet.create({
  main: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
});

export default ThemedImagePickerModal;
