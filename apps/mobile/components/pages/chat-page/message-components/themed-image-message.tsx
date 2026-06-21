import React, { useState } from 'react';
import { Image, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

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
        <View className="w-[100%] overflow-hidden bg-transparent rounded-tl-[13px] rounded-tr-[13px] rounded-bl-[5px] rounded-br-[5px]">
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
        <View onLayout={onLayout} className="flex-row justify-between w-[100%]">
          <Image
            className="rounded-[13px]"
            height={width / scaleFactor}
            width={width / scaleFactor}
            resizeMode="cover"
            source={{ uri: props.sources[0] }}
          ></Image>
          <Image
            className="rounded-[13px]"
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
        <View className="flex-col gap-[3px]">
          <View
            onLayout={onLayout}
            className="flex-row justify-between w-[100%]"
          >
            <Image
              className="rounded-[13px]"
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[0] }}
            ></Image>
            <Image
              className="rounded-[13px]"
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[1] }}
            ></Image>
          </View>
          <View
            onLayout={onLayout}
            className="flex-row justify-between w-[100%]"
          >
            <Image
              className="rounded-[13px]"
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
      const numberOfPicturesRemaining = numberOfPictures - 3;
      return (
        <View className="flex-col gap-[3px]">
          <View
            onLayout={onLayout}
            className="flex-row justify-between w-[100%]"
          >
            <Image
              className="rounded-[13px]"
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[0] }}
            ></Image>
            <Image
              className="rounded-[13px]"
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[1] }}
            ></Image>
          </View>
          <View
            onLayout={onLayout}
            className="flex-row justify-between w-[100%]"
          >
            <Image
              className="rounded-[13px]"
              height={width / scaleFactor}
              width={width / scaleFactor}
              resizeMode="cover"
              source={{ uri: props.sources[2] }}
            ></Image>
            <View
              className={`flex-col items-center justify-center gap-[5px] rounded-[13px] ${!userIsSender ? 'bg-primary-100' : 'bg-neutral-100'}`}
              style={{
                height: width / scaleFactor,
                width: width / scaleFactor,
              }}
            >
              <Icon
                size={35}
                className={
                  !userIsSender ? 'text-primary-900' : 'text-neutral-900'
                }
                name="panorama"
              ></Icon>
              <Text
                className={
                  !userIsSender ? 'text-primary-900' : 'text-neutral-900'
                }
                variant="caption"
              >
                {'+ ' + numberOfPicturesRemaining + ' ' + 'Bilder'}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    default:
      return <Text>Images go here</Text>;
  }
};

export default ThemedImageMessage;
