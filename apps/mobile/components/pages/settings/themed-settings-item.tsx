import React from 'react';
import { View } from 'react-native';

import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

export type ThemedSettingsItemProp = {
  label: string;
  icomoonIcon: string;
  type: 'switch' | 'link';
  onPressAction?: string;
  isActive?: boolean;
  onValueChange?: () => void;
};

const ThemedSettingsItem = ({ ...props }: ThemedSettingsItemProp) => {
  return (
    <View className="bg-neutral-100 w-full h-[68px] justify-between px-[20px] items-center flex-row rounded-[18px]">
      <View className="gap-[15px] flex-row items-center">
        <Icon
          size={24}
          className="text-neutral-900"
          name={props.icomoonIcon}
        ></Icon>
        <Text variant="body" className="text-neutral-900">
          {props.label}
        </Text>
      </View>
      {props.type === 'link' ? (
        <View className="px-[8px] py-[3px] bg-primary-300 rounded-[6px]">
          <Icon
            size={20}
            className="text-neutral-900"
            name="arrow-right"
          ></Icon>
        </View>
      ) : (
        <Switch
          defaultChecked={props.isActive}
          onCheckedChange={() => {
            if (
              props.onValueChange !== null &&
              props.onValueChange !== undefined
            ) {
              props.onValueChange();
            }
          }}
        />
      )}
    </View>
  );
};

export default ThemedSettingsItem;
