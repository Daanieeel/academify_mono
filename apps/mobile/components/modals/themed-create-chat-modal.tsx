import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import ThemedModal from '@/components/modals/themed-modal';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

import ThemedListPreviewItem, {
  ThemedListPreviewItemProps,
} from '@/components/modals/themed-picker-modal/themed-list-preview-item';
import ThemedPickerModal from '@/components/modals/themed-picker-modal/themed-picker-modal';
import ThemedSearchBar from '@/components/themed-search-bar';
import APPLICATION_CONSTANTS from '@/constants/strings';
import { api } from '@/lib/api-client';

type GetManyContactsDto = NonNullable<
  Awaited<ReturnType<typeof api.contacts.get>>['data']
>;
type SingleContactDto = GetManyContactsDto[0];

type GetManyClassesDto = NonNullable<
  Awaited<ReturnType<typeof api.classes.get>>['data']
>;
type SingleClassDto = GetManyClassesDto[0];
import { formatRoleIcon, formatRoleLabel } from '@/lib/format';
import type { ThemedUserBadgeProps } from '@/components/pages/settings/themed-profile-preview';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import ThemedPressable from '../themed-pressable';
import ThemedAvatarPickerModal, {
  AVATAR_PRESETS,
} from './themed-avatar-picker-modal';
import { serializeAvatarGradient } from '@/lib/avatar';

const DEFAULT_GROUP_AVATAR = {
  backgroundColor: serializeAvatarGradient(AVATAR_PRESETS[0]?.gradient ?? []),
  emoji: AVATAR_PRESETS[0]?.emoji ?? '',
};

const ROLE_GROUP_ORDER: SingleContactDto['role'][] = [
  'teacher',
  'student',
  'headmaster',
  'admin',
  'compliance_officer',
];

function groupContactsByRole(
  contacts: SingleContactDto[],
): { key: string; label: string; contacts: SingleContactDto[] }[] {
  const groups = new Map<string, SingleContactDto[]>();
  for (const contact of contacts) {
    const key = contact.role ?? 'other';
    const list = groups.get(key) ?? [];
    list.push(contact);
    groups.set(key, list);
  }

  const ordered: {
    key: string;
    label: string;
    contacts: SingleContactDto[];
  }[] = [];
  for (const role of ROLE_GROUP_ORDER) {
    const list = role ? groups.get(role) : undefined;
    if (role && list && list.length > 0) {
      const label = formatRoleLabel(role);
      ordered.push({
        key: role,
        label: label ?? 'Other',
        contacts: list,
      });
    }
  }
  const other = groups.get('other');
  if (other && other.length > 0) {
    ordered.push({
      key: 'other',
      label: APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_OTHER_ROLE_GROUP_LABEL,
      contacts: other,
    });
  }
  return ordered;
}

function contactBadges(contact: SingleContactDto): ThemedUserBadgeProps[] {
  const badges: ThemedUserBadgeProps[] = [];
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
  return badges;
}

function contactToListItem(
  contact: SingleContactDto,
): ThemedListPreviewItemProps {
  return {
    userId: contact.user_id,
    heading: contact.display_name,
    badges: contactBadges(contact),
    avatarBackgroundColor: contact.avatar_background_color,
    avatarEmoji: contact.avatar_emoji,
  };
}

function classToListItem(
  schoolClass: SingleClassDto,
): ThemedListPreviewItemProps {
  return {
    userId: schoolClass.class_id,
    heading: schoolClass.class_name,
    caption: `${schoolClass.member_count} Schüler:innen`,
  };
}

export type ThemedCreateChatModalProps = {
  visible: boolean;
  mode: 'single' | 'group';
  onRequestClose: () => void;
  onChatCreated: (chatId: string) => void;
};

export type ThemedBentoBoxProps = {
  label?: string;
  children?: React.ReactNode;
};

const ThemedBentoBox = (props: ThemedBentoBoxProps) => {
  return (
    <View className="bg-neutral-50 rounded-[18px]">
      {props.label && (
        <Text
          className="pt-[15px] pl-[15px] text-neutral-600"
          variant="caption"
        >
          {props.label}
        </Text>
      )}
      <View className="px-[20px] pt-[15px] pb-[10px]">{props.children}</View>
    </View>
  );
};

const ThemedCreateChatModal = (props: ThemedCreateChatModalProps) => {
  const isGroup = props.mode === 'group';
  const [selectUserModalShown, setSelectUserModalShown] = useState(false);
  const [selectClassModalShown, setSelectClassModalShown] = useState(false);
  const [avatarModalShown, setAvatarModalShown] = useState(false);
  const [avatarBackgroundColor, setAvatarBackgroundColor] = useState<
    string | undefined
  >(DEFAULT_GROUP_AVATAR.backgroundColor);
  const [avatarEmoji, setAvatarEmoji] = useState<string | undefined>(
    DEFAULT_GROUP_AVATAR.emoji,
  );
  const { data: contactsData } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await api.contacts.get();
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: props.visible,
  });
  const contacts = useMemo(() => contactsData ?? [], [contactsData]);

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await api.classes.get();
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: props.visible,
  });
  const schoolClasses = classesData ?? [];

  const [selectedMemberIds, setSelectedMemberIds] = useState<
    (number | string)[]
  >([]);
  const [selectedClassIds, setSelectedClassIds] = useState<(number | string)[]>(
    [],
  );
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  const onContactPressed = async (peerUserId: string) => {
    const { data, error } = await api.chats.post({ peer_user_id: peerUserId });
    if (error) {
      throw error;
    }
    if (data) {
      props.onChatCreated(data.chat_id);
    }
  };

  const onRequestClosedTriggered = () => {
    props.onRequestClose();
  };

  const onAddUserPressed = () => {
    setSelectUserModalShown(true);
  };

  const onAddClassPressed = () => {
    setSelectClassModalShown(true);
  };

  const onCreateChatPressed = () => {};

  const onAvatarPressed = () => {
    setAvatarModalShown(true);
  };

  const selectedMembers = contacts.filter((contact) =>
    selectedMemberIds.includes(contact.user_id),
  );
  const selectedClasses = schoolClasses.filter((schoolClass) =>
    selectedClassIds.includes(schoolClass.class_id),
  );

  const filteredContacts = useMemo(() => {
    const query = contactSearchQuery.trim().toLowerCase();
    if (!query) {
      return contacts;
    }
    return contacts.filter((contact) =>
      contact.display_name.toLowerCase().includes(query),
    );
  }, [contacts, contactSearchQuery]);

  const groupedContacts = useMemo(
    () => groupContactsByRole(filteredContacts),
    [filteredContacts],
  );

  return (
    <ThemedModal
      visible={props.visible}
      onRequestClose={onRequestClosedTriggered}
    >
      {/* Modal for picking the group avatar's emoji/gradient combo */}
      <ThemedAvatarPickerModal
        visible={avatarModalShown}
        onRequestClose={() => setAvatarModalShown(false)}
        currentBackgroundColor={avatarBackgroundColor}
        currentEmoji={avatarEmoji}
        persist={false}
        onSaved={({ backgroundColor, emoji }) => {
          setAvatarBackgroundColor(backgroundColor);
          setAvatarEmoji(emoji);
        }}
      ></ThemedAvatarPickerModal>

      {/* Modal for when the user wants to add additional single users */}
      <ThemedPickerModal
        title="Nach Benutzern suchen"
        items={contacts.map(contactToListItem)}
        initialSelectedIds={selectedMemberIds}
        onFinished={setSelectedMemberIds}
        visible={selectUserModalShown}
        onRequestClose={() => setSelectUserModalShown(false)}
      ></ThemedPickerModal>

      {/* Modal for when the user wants to add additional classes */}
      <ThemedPickerModal
        title="Nach Klassen suchen"
        items={schoolClasses.map(classToListItem)}
        initialSelectedIds={selectedClassIds}
        onFinished={setSelectedClassIds}
        visible={selectClassModalShown}
        onRequestClose={() => setSelectClassModalShown(false)}
      ></ThemedPickerModal>

      {/* Button for creating the group */}
      {isGroup ? (
        <View className="absolute bottom-[30px] left-[15px] right-[15px] z-[999]">
          <Button variant="primary" size="lg" onPress={onCreateChatPressed}>
            <Text>Gruppe erstellen</Text>
            <Icon name="check" size={24} />
          </Button>
        </View>
      ) : undefined}

      <View className="pt-[20px] px-[15px] pb-[10px]">
        <Text variant="heading2">
          {isGroup
            ? APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_SLIDER_OPTION_1
            : APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_SLIDER_OPTION_2}
        </Text>
      </View>

      {isGroup ? (
        <ScrollView
          contentContainerStyle={{
            gap: 40,
            paddingBottom: 150,
          }}
          className="pt-[20px] px-[15px]"
        >
          {/* Row for the group avatar and name, picked/typed side by side */}

          <View className="flex-row items-center gap-[15px]">
            <Avatar
              onPress={onAvatarPressed}
              backgroundColor={avatarBackgroundColor}
              emoji={avatarEmoji}
              variant="group"
              showBorder={false}
              size="medium"
            ></Avatar>
            <View className="flex-1">
              <Input
                variant="big"
                className="text-[26px] leading-[30px]"
                placeholder="Gruppenname"
              ></Input>
            </View>
          </View>

          {/* Container for the text field where the user can add the group description */}

          <Input variant="normal" placeholder="Gruppenbeschreibung"></Input>

          {/* Bento box for showing classes and adding additional ones */}

          <ThemedBentoBox label="Hinzugefügte Klassen">
            {selectedClasses.map((schoolClass) => (
              <View key={schoolClass.class_id}>
                <ThemedListPreviewItem
                  {...classToListItem(schoolClass)}
                  showRemoveButton
                  onRemovePress={() =>
                    setSelectedClassIds((prev) =>
                      prev.filter((id) => id !== schoolClass.class_id),
                    )
                  }
                  className="bg-transparent"
                  paddingVertical={10}
                ></ThemedListPreviewItem>
                <Separator></Separator>
              </View>
            ))}
            <View className="pt-[20px] pb-[10px] flex-row justify-center">
              <Button variant="normal" onPress={onAddClassPressed}>
                <Icon name="plus" size={18} />
                <Text>Weitere Klasse hinzufügen</Text>
              </Button>
            </View>
          </ThemedBentoBox>

          {/* Bento Box for showing group members and adding additional ones */}
          <ThemedBentoBox label="Gruppenmitglieder">
            {selectedMembers.map((contact) => (
              <View key={contact.user_id}>
                <ThemedListPreviewItem
                  {...contactToListItem(contact)}
                  showRemoveButton
                  onRemovePress={() =>
                    setSelectedMemberIds((prev) =>
                      prev.filter((id) => id !== contact.user_id),
                    )
                  }
                  className="bg-transparent"
                  paddingVertical={10}
                ></ThemedListPreviewItem>
                <Separator></Separator>
              </View>
            ))}
            <View className="flex-row justify-center">
              <View className="pt-[20px] pb-[10px] flex-row justify-center">
                <Button variant="normal" onPress={onAddUserPressed}>
                  <Icon name="plus" size={18} />
                  <Text>Weitere Benutzer hinzufügen</Text>
                </Button>
              </View>
            </View>
          </ThemedBentoBox>
        </ScrollView>
      ) : (
        <>
          <View className="px-[15px] pt-[10px]">
            <ThemedSearchBar
              placeholder={
                APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_SINGLE_SEARCH_PLACEHOLDER
              }
              value={contactSearchQuery}
              onInputChanged={setContactSearchQuery}
            ></ThemedSearchBar>
          </View>

          <ScrollView
            contentContainerStyle={{
              gap: 20,
              paddingTop: 20,
              paddingBottom: 40,
            }}
            className="px-[15px]"
          >
            {groupedContacts.map((group) => (
              <View key={group.key} className="gap-[10px]">
                <Text className="px-[5px] text-neutral-600" variant="caption">
                  {group.label}
                </Text>
                {group.contacts.map((contact) => (
                  <ThemedPressable
                    key={contact.user_id}
                    onPress={() => onContactPressed(contact.user_id)}
                  >
                    <ThemedListPreviewItem
                      borderRadius={18}
                      userId={contact.user_id}
                      heading={contact.display_name}
                      badges={contactBadges(contact)}
                      avatarBackgroundColor={contact.avatar_background_color}
                      avatarEmoji={contact.avatar_emoji}
                      showChevron
                      backgroundColor="#ffffff"
                      paddingVertical={15}
                      paddingHorizontal={15}
                    />
                  </ThemedPressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </ThemedModal>
  );
};

export default ThemedCreateChatModal;
