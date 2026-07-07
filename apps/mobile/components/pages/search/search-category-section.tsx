import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import APPLICATION_CONSTANTS from '@/constants/strings';

export type SearchCategorySectionProps = {
  title: string;
  icon: string;
  hasMore: boolean;
  onShowMore: () => void;
  children: React.ReactNode;
};

const SearchCategorySection = ({
  title,
  icon,
  hasMore,
  onShowMore,
  children,
}: SearchCategorySectionProps) => {
  return (
    <View className="mb-[25px]">
      <View className="flex-row items-center gap-[8px] mb-[10px] px-[15px]">
        <Icon name={icon} size={18} className="text-neutral-500" />
        <Text variant="body" className="font-semibold text-neutral-500">
          {title}
        </Text>
      </View>
      <View className="px-[10px]">{children}</View>
      {hasMore && (
        <View className="px-[15px] mt-[5px]">
          <Button variant="outline" onPress={onShowMore} className="py-[10px]">
            <Text>{APPLICATION_CONSTANTS.SEARCH_SHOW_MORE}</Text>
            <Icon name="caret-right" size={16} />
          </Button>
        </View>
      )}
    </View>
  );
};

export default SearchCategorySection;
