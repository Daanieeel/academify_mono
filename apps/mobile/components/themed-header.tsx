import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useInstitution } from '@/context/institution-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ThemedSchoolSwitcherModal } from '@/components/modals/themed-school-switcher-modal';

export type ThemedHeaderProps = {
  headerTitle: string;
  headerCompRight?: React.ReactNode;
};

const ThemedHeader = (props: ThemedHeaderProps) => {
  const { activeInstitutionId } = useInstitution();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await api.me.profiles.get();
      if (error) {throw error;}
      return data.profiles;
    },
  });

  const activeProfile = profiles?.find(
    (p) => p.institution_id === activeInstitutionId,
  );

  return (
    <View className="px-[15px] overflow-hidden pt-[10px] pb-[10px] bg-neutral-50">
      <View className="w-full justify-between flex-row items-center">
        <Text
          numberOfLines={1}
          className="text-left flex-1 mr-[10px]"
          variant="heading2"
        >
          {props.headerTitle}
        </Text>
        <View className="flex-row items-center">
          {activeProfile && (
            <TouchableOpacity
              onPress={() => setSwitcherVisible(true)}
              className="flex-row items-center bg-neutral-200 px-[10px] py-[6px] rounded-full mr-[10px]"
            >
              <Icon
                name="buildings"
                size={16}
                className="text-neutral-700 mr-[6px]"
              />
              <Text
                variant="caption"
                className="text-neutral-900 font-medium max-w-[100px]"
                numberOfLines={1}
              >
                {activeProfile.institution_name}
              </Text>
            </TouchableOpacity>
          )}
          {props.headerCompRight}
        </View>
      </View>
      <ThemedSchoolSwitcherModal
        visible={switcherVisible}
        onRequestClose={() => setSwitcherVisible(false)}
      />
    </View>
  );
};

export default ThemedHeader;
