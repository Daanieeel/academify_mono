import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import React from 'react';
import { View } from 'react-native';

export type ThemedSearchBarProps = {
  placeholder: string;
  value: string;
  onInputChanged: (input: string) => void;
};

const ThemedSearchBar = ({
  placeholder,
  value,
  onInputChanged,
}: ThemedSearchBarProps) => {
  return (
    <View className="bg-neutral-200 rounded-[18px] h-[45px] w-full flex-row px-[15px] items-center gap-[10px]">
      <Icon size={25} name="binoculars" className="text-neutral-600" />
      <Input
        containerClassName="flex-1 bg-transparent p-0"
        numberOfLines={1}
        value={value}
        onChange={(input) => onInputChanged(input.nativeEvent.text)}
        placeholder={placeholder}
        className="bg-transparent"
      />
    </View>
  );
};

export default ThemedSearchBar;
