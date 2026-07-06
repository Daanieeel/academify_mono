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
import { api } from '@/lib/api-client';

export type GetManySearchDto = NonNullable<
  Awaited<ReturnType<typeof api.search.get>>['data']
>;
export type SingleSearchContactDto = NonNullable<
  GetManySearchDto['contacts']
>['items'][0];
export type SingleSearchChatDto = NonNullable<
  GetManySearchDto['chats']
>['items'][0];
export type SingleSearchBlackboardDto = NonNullable<
  GetManySearchDto['blackboards']
>['items'][0];
export type SingleSearchClubDto = NonNullable<
  GetManySearchDto['clubs']
>['items'][0];

export type SearchResultItemData =
  | { type: 'contact'; data: SingleSearchContactDto }
  | { type: 'chat'; data: SingleSearchChatDto }
  | { type: 'blackboard'; data: SingleSearchBlackboardDto }
  | { type: 'club'; data: SingleSearchClubDto }
  | { type: 'setting'; data: ThemedSettingsItemProp };

export type SearchResultItemProps = SearchResultItemData & {
  onPress: () => void;
};

const SearchResultItem = (props: SearchResultItemProps) => {
  if (props.type === 'contact') {
    const contact = props.data;
    const badges = [];
    if (contact.role) {
      const iconName = formatRoleIcon(contact.role);
      const label = formatRoleLabel(contact.role);
      if (iconName && label) {
        badges.push({
          icomoonIconName: iconName,
          label,
        });
      }
    }
    if (contact.class_name) {
      badges.push({
        icomoonIconName: 'graduation-cap',
        label: contact.class_name,
      });
    }

    return (
      <ThemedPressable onPress={props.onPress}>
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

  if (props.type === 'chat') {
    const chat = props.data;
    return (
      <ThemedPressable onPress={props.onPress}>
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

  if (props.type === 'blackboard') {
    const post = props.data;
    return (
      <ThemedPressable onPress={props.onPress}>
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

  if (props.type === 'club') {
    const club = props.data;
    return (
      <ThemedPressable onPress={props.onPress}>
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

  if (props.type === 'setting') {
    const setting = props.data;
    return (
      <ThemedPressable onPress={props.onPress}>
        <View className="mb-[10px]">
          <ThemedSettingsItem {...setting} />
        </View>
      </ThemedPressable>
    );
  }

  return null;
};

export default SearchResultItem;
