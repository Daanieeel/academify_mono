import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Avatar } from '@/components/ui/avatar';
import ThemedPressable from '@/components/themed-pressable';

export type ThemedUserBadgeProps = {
  icomoonIconName: string;
  label: string;
};

export const ThemedUserBadge = (props: ThemedUserBadgeProps) => {
  const uppercaseLabel = props.label.toUpperCase();

  return (
    <View className="bg-primary-900 px-[5px] rounded-[8px] py-[5px] gap-[2px] items-center flex-row">
      <Icon name={props.icomoonIconName} className="text-primary-100"></Icon>
      <Text variant="caption" className="text-primary-100">
        {uppercaseLabel}
      </Text>
    </View>
  );
};

export type ThemedProfilePreviewProps = {
  username: string;
  firstName?: string;
  lastName?: string;
  badges: ThemedUserBadgeProps[];
  imageSource?: string;
  avatarBackgroundColor?: string | null;
  avatarEmoji?: string | null;
  onAvatarPress?: () => void;
};

const ThemedProfilePreview = ({
  firstName = '',
  lastName = '',
  ...props
}: ThemedProfilePreviewProps) => {
  return (
    <View className="w-full rounded-[18px] items-center py-[20px] gap-[15px] bg-neutral-100">
      <View>
        <Avatar
          size="lg"
          source={props.imageSource}
          backgroundColor={props.avatarBackgroundColor}
          emoji={props.avatarEmoji}
          onPress={props.onAvatarPress}
        ></Avatar>
        {props.onAvatarPress && (
          <View className="absolute bottom-0 right-0">
            <ThemedPressable onPress={props.onAvatarPress}>
              <View className="h-[44px] w-[44px] items-center justify-center rounded-full bg-neutral-900 border-[3px] border-neutral-100">
                <Icon name="pencil" size={20} className="text-neutral-50" />
              </View>
            </ThemedPressable>
          </View>
        )}
      </View>
      <View className="gap-[0px] items-center">
        <Text variant="subheading">{firstName + ' ' + lastName}</Text>
        <Text className="text-neutral-700" variant="caption">
          {props.username}
        </Text>
      </View>
      <View className="flex-row gap-[5px]">
        {props.badges.map((badgeProps, key) => (
          <ThemedUserBadge {...badgeProps} key={key}></ThemedUserBadge>
        ))}
      </View>
    </View>
  );
};

export default ThemedProfilePreview;
