import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useInstitution } from '@/context/institution-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { parseAvatarGradient } from '@/lib/avatar';
import { LinearGradient } from 'expo-linear-gradient';
import { MenuView } from '@expo/ui/community/menu';

export type ThemedHeaderProps = {
  headerTitle: string;
  headerCompRight?: React.ReactNode;
};

const ThemedHeader = (props: ThemedHeaderProps) => {
  const { activeInstitutionId, setActiveInstitutionId } = useInstitution();

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await api.me.profiles.get();
      if (error) {
        throw error;
      }
      return data.profiles;
    },
  });

  const activeProfile = profiles?.find(
    (p: any) =>
      p.institution_id === activeInstitutionId ||
      p.institution_slug === activeInstitutionId,
  );

  const menuActions = [
    ...(profiles || []).map((p: any) => ({
      id: p.institution_id,
      title: p.institution_name,
      state:
        p.institution_id === activeInstitutionId ||
        p.institution_slug === activeInstitutionId
          ? 'on'
          : 'off',
    })),
    {
      id: 'add_institution',
      title: 'Institution hinzufügen...',
    },
  ];

  return (
    <View className="px-[15px] overflow-hidden pt-[10px] pb-[10px] bg-neutral-50">
      <View className="w-full justify-between flex-row items-center min-h-[44px]">
        <Text
          numberOfLines={1}
          className="text-left flex-shrink mr-[10px]"
          variant="heading2"
          style={{ fontSize: 28, lineHeight: 32 }}
        >
          {props.headerTitle}
        </Text>

        <View className="flex-row items-center relative">
          {activeProfile && (
            <View className="relative flex-row items-center ml-[5px] mr-[5px]">
              {/* Visual trigger */}
              <View className="flex-row items-center">
                <View className="w-[30px] h-[30px] rounded-full overflow-hidden mr-[8px] justify-center items-center relative">
                  <LinearGradient
                    colors={parseAvatarGradient(activeProfile.institution_id)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <Text
                    className="text-white font-bold"
                    style={{ fontSize: 10 }}
                  >
                    {activeProfile.institution_name
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
                <View
                  className="justify-center flex-shrink"
                  style={{ maxWidth: 200 }}
                >
                  <Text
                    variant="body1"
                    className="text-neutral-900 font-bold"
                    style={{ fontSize: 14 }}
                    numberOfLines={1}
                  >
                    {activeProfile.institution_name}
                  </Text>
                </View>
                <Icon
                  name="caret-down"
                  size={14}
                  className="text-neutral-500 ml-[4px]"
                />
              </View>

              {/* Invisible touch target to trigger menu */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <MenuView
                  actions={menuActions as any}
                  onPressAction={(e) => {
                    const actionId = e.nativeEvent.event;
                    if (actionId === 'add_institution') {
                      // To be implemented
                    } else {
                      setActiveInstitutionId(actionId);
                    }
                  }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TouchableOpacity
                    style={{ width: '100%', height: '100%' }}
                    activeOpacity={1}
                  >
                    <View style={{ flex: 1, backgroundColor: 'transparent' }} />
                  </TouchableOpacity>
                </MenuView>
              </View>
            </View>
          )}
          {props.headerCompRight}
        </View>
      </View>
    </View>
  );
};

export default ThemedHeader;
