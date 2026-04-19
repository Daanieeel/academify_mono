import IcomoonIcon from '@/components/IcomoonIcon';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export type ThemedImageMessageProps = {
  sources: string[];
  userIsSender?: boolean;
};

const ThemedImageMessage = ({
  userIsSender = true,
  ...props
}: ThemedImageMessageProps) => {
  const [width, setWidth] = useState(0);

  const onLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setWidth(width);
  };

  const numberOfPictures = props.sources.length;

  switch (true) {
    case numberOfPictures === 1:
      return (
        <View style={styles['image-1-container']}>
          <Image
            height={400}
            width={undefined}
            resizeMode="cover"
            source={{ uri: props.sources[0] }}
          ></Image>
        </View>
      );
    case numberOfPictures === 2: {
      const scaleFactor = 2.02;
      return (
        <View onLayout={onLayout} style={styles['image-2-3-4-inner-container']}>
          <Image
            style={styles['image-2-3-4']}
            height={width / scaleFactor}
            width={width / scaleFactor}
            resizeMode="cover"
            source={{ uri: props.sources[0] }}
          ></Image>
          <Image
            style={styles['image-2-3-4']}
            height={width / scaleFactor}
            width={width / scaleFactor}
            resizeMode="cover"
            source={{ uri: props.sources[1] }}
          ></Image>
        </View>
      );
    }
    case numberOfPictures === 3: {
      const scaleFactor = 2.02;
      return (
        <View style={styles['image-3-4-outer-container']}>
          <View
            onLayout={onLayout}
            style={styles['image-2-3-4-inner-container']}
          >
            <Image
              style={styles['image-2-3-4']}
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[0] }}
            ></Image>
            <Image
              style={styles['image-2-3-4']}
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[1] }}
            ></Image>
          </View>
          <View
            onLayout={onLayout}
            style={styles['image-2-3-4-inner-container']}
          >
            <Image
              style={styles['image-2-3-4']}
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[2] }}
            ></Image>
          </View>
        </View>
      );
    }
    case numberOfPictures >= 4: {
      const scaleFactor = 2.02;
      const backgroundColor = !userIsSender
        ? useThemeColor({}, 'primary-100')
        : useThemeColor({}, 'neutral-100');
      const textColor = !userIsSender
        ? useThemeColor({}, 'primary-900')
        : useThemeColor({}, 'neutral-900');
      const numberOfPicturesRemaining = numberOfPictures - 3;
      return (
        <View style={styles['image-3-4-outer-container']}>
          <View
            onLayout={onLayout}
            style={styles['image-2-3-4-inner-container']}
          >
            <Image
              style={styles['image-2-3-4']}
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[0] }}
            ></Image>
            <Image
              style={styles['image-2-3-4']}
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[1] }}
            ></Image>
          </View>
          <View
            onLayout={onLayout}
            style={styles['image-2-3-4-inner-container']}
          >
            <Image
              style={styles['image-2-3-4']}
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[2] }}
            ></Image>
            <View
              style={[
                {
                  height: width / scaleFactor,
                  width: width / scaleFactor,
                  backgroundColor,
                  borderRadius: 13,
                },
                styles['placeholder'],
              ]}
            >
              <IcomoonIcon
                size={35}
                color={textColor}
                name="panorama"
              ></IcomoonIcon>
              <ThemedText color={textColor} type="caption">
                {'+ ' + numberOfPicturesRemaining + ' ' + 'Bilder'}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    }

    default:
      return <Text>Images go here</Text>;
  }
};

const styles = StyleSheet.create({
  'image-1-container': {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  'image-2-3-4-inner-container': {
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  'image-2-3-4': {
    borderRadius: 13,
  },
  'image-3-4-outer-container': {
    flexDirection: 'column',
    gap: 3,
  },
  placeholder: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});
export default ThemedImageMessage;
