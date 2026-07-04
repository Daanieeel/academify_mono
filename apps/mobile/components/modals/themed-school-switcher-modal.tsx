import React, { useEffect, useState } from 'react';
import { FlatList, View, TouchableOpacity } from 'react-native';
import ThemedModal from './themed-modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useInstitution } from '@/context/institution-context';
import { formatRoleIcon, formatRoleLabel } from '@/lib/format';
import { parseAvatarGradient } from '@/lib/avatar';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  visible: boolean;
  onRequestClose: () => void;
};

export const ThemedSchoolSwitcherModal = ({
  visible,
  onRequestClose,
}: Props) => {
  const { activeInstitutionId, setActiveInstitutionId } = useInstitution();

  const { data, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await api.me.profiles.get();
      if (error) {throw error;}
      return data.profiles;
    },
    enabled: visible,
  });

  const onSelect = async (id: string) => {
    await setActiveInstitutionId(id);
    onRequestClose();
  };

  return (
    <ThemedModal visible={visible} onRequestClose={onRequestClose}>
      <View className="px-[15px] pt-[20px] pb-[10px] flex-row justify-between items-center">
        <Text variant="h2" className="text-neutral-900">
          Profil wechseln
        </Text>
        <Button variant="ghost" onPress={onRequestClose} size="icon">
          <Icon name="x" size={24} className="text-neutral-500" />
        </Button>
      </View>
      <FlatList
        className="px-[15px] pt-[10px]"
        data={data || []}
        keyExtractor={(item) => item.institution_id}
        renderItem={({ item }) => {
          const isActive = activeInstitutionId === item.institution_id;
          return (
            <TouchableOpacity
              onPress={() => onSelect(item.institution_id)}
              className={`flex-row items-center p-[15px] mb-[10px] rounded-[16px] border ${
                isActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <View className="w-[40px] h-[40px] rounded-full bg-neutral-200 items-center justify-center mr-[15px]">
                <Icon name="buildings" size={20} className="text-neutral-500" />
              </View>
              <View className="flex-1">
                <Text variant="body1" className="text-neutral-900 font-bold">
                  {item.institution_name}
                </Text>
                <Text variant="caption" className="text-neutral-500 mt-[2px]">
                  {item.display_name}
                </Text>
              </View>
              {isActive && (
                <Icon
                  name="check-circle"
                  size={24}
                  className="text-primary-500"
                />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View className="py-[20px] items-center">
            <Text variant="body2" className="text-neutral-500">
              {isLoading ? 'Lade...' : 'Keine Profile gefunden.'}
            </Text>
          </View>
        )}
      />
    </ThemedModal>
  );
};
