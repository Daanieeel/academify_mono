import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import ThemedListPreviewItem from '@/components/modals/themed-picker-modal/themed-list-preview-item';
import ThemedChatPreview from '@/components/pages/chats/themed-chat-preview';
import ThemedSettingsItem, {
  type ThemedSettingsItemProp,
} from '@/components/pages/settings/themed-settings-item';
import ThemedPressable from '@/components/themed-pressable';
import {
  formatRoleIcon,
  formatRoleLabel,
  formatChatTimestamp,
} from '@/lib/format';
import type {
  SearchContactDto,
  SearchChatDto,
  SearchBlackboardDto,
  SearchClubDto,
} from '@/lib/api-client';

export type SearchResultItemProps = {
  type: 'contact' | 'chat' | 'blackboard' | 'club' | 'setting';
  data: any;
  onPress: () => void;
};

const SearchResultItem = ({ type, data, onPress }: SearchResultItemProps) => {
  if (type === 'contact') {
    const contact = data as SearchContactDto;
    const badges = [];
    if (contact.role) {
      badges.push({
        icomoonIconName: formatRoleIcon(contact.role)!,
        label: formatRoleLabel(contact.role)!,
      });
    }
    if (contact.class_name) {
      badges.push({
        icomoonIconName: 'graduation-cap',
        label: contact.class_name,
      });
    }

    return (
      <ThemedPressable onPress={onPress}>
        <ThemedListPreviewItem
          userId={contact.user_id}
          heading={contact.display_name}
          badges={badges}
          avatarBackgroundColor={contact.avatar_background_color}
          avatarEmoji={contact.avatar_emoji}
          backgroundColor="transparent"
          paddingVertical={10}
        />
      </ThemedPressable>
    );
  }

  if (type === 'chat') {
    const chat = data as SearchChatDto;
    return (
      <ThemedPressable onPress={onPress}>
        <ThemedChatPreview
          chatName={chat.peer.display_name}
          lastMessageTime={
            chat.last_message_at
              ? formatChatTimestamp(chat.last_message_at)
              : undefined
          }
          lastMessage={undefined}
          lastMessageType="text"
          read={true} // In search results, we don't know the exact read state, assume read to not show dot
          isTemporary={false}
        />
      </ThemedPressable>
    );
  }

  if (type === 'blackboard') {
    const post = data as SearchBlackboardDto;
    return (
      <ThemedPressable onPress={onPress}>
        <View className="py-[10px] px-[5px] flex-row gap-[15px] items-center">
          <View className="bg-primary-100 rounded-full h-[45px] w-[45px] items-center justify-center">
            <Icon
              name="megaphone-simple"
              className="text-primary-900"
              size={24}
            />
          </View>
          <View className="flex-1 gap-[4px]">
            <Text variant="body" numberOfLines={1}>
              {post.title}
            </Text>
            <Text
              variant="caption"
              className="text-neutral-600"
              numberOfLines={2}
            >
              {post.body}
            </Text>
          </View>
        </View>
      </ThemedPressable>
    );
  }

  if (type === 'club') {
    const club = data as SearchClubDto;
    return (
      <ThemedPressable onPress={onPress}>
        <View className="py-[10px] px-[5px] flex-row gap-[15px] items-center">
          <View className="bg-primary-100 rounded-full h-[45px] w-[45px] items-center justify-center">
            <Icon name="users-three" className="text-primary-900" size={24} />
          </View>
          <View className="flex-1 gap-[4px]">
            <Text variant="body" numberOfLines={1}>
              {club.name}
            </Text>
            {club.description && (
              <Text
                variant="caption"
                className="text-neutral-600"
                numberOfLines={2}
              >
                {club.description}
              </Text>
            )}
          </View>
        </View>
      </ThemedPressable>
    );
  }

  if (type === 'setting') {
    const setting = data as ThemedSettingsItemProp;
    return (
      <ThemedPressable onPress={onPress}>
        <ThemedSettingsItem {...setting} />
      </ThemedPressable>
    );
  }

  return null;
};

export default SearchResultItem;
