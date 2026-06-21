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
import APPLICATION_CONSTANTS from '@/constants/strings';
import { api, type Contact, type SchoolClass } from '@/lib/api-client';
import { formatRoleIcon, formatRoleLabel } from '@/lib/format';
import type { ThemedUserBadgeProps } from '@/components/pages/settings/themed-profile-preview';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import ThemedPressable from '../themed-pressable';
import ThemedImagePickerModal, {
  IMAGE_URIS,
} from './themed-image-picker-modal';

function contactBadges(contact: Contact): ThemedUserBadgeProps[] {
  const badges: ThemedUserBadgeProps[] = [];
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
  return badges;
}

function contactToListItem(contact: Contact): ThemedListPreviewItemProps {
  return {
    userId: contact.user_id,
    heading: contact.display_name,
    badges: contactBadges(contact),
  };
}

function classToListItem(schoolClass: SchoolClass): ThemedListPreviewItemProps {
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
  const [avatarSource, setAvatarSource] = useState<string | undefined>(
    undefined,
  );
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<
    (number | string)[]
  >([]);
  const [selectedClassIds, setSelectedClassIds] = useState<(number | string)[]>(
    [],
  );

  useEffect(() => {
    if (!props.visible) {
      return;
    }
    api.getContacts().then(setContacts).catch(console.error);
    api.getClasses().then(setSchoolClasses).catch(console.error);
  }, [props.visible]);

  const onContactPressed = async (peerUserId: string) => {
    const { chat_id } = await api.createChat(peerUserId);
    props.onChatCreated(chat_id);
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

  return (
    <ThemedModal
      visible={props.visible}
      onRequestClose={onRequestClosedTriggered}
    >
      {/* Modal for picking a new Group Image */}
      <ThemedImagePickerModal
        images={IMAGE_URIS}
        onCallBack={(uri) => setAvatarSource(uri)}
        onRequestClose={() => setAvatarModalShown(false)}
        visible={avatarModalShown}
      ></ThemedImagePickerModal>

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
          {/* For creating a group avatar */}

          <View className="flex-row justify-center pt-[30px]">
            <Avatar
              onPress={onAvatarPressed}
              source={avatarSource}
              variant="group"
              showBorder={false}
              size="extra-large"
            ></Avatar>
          </View>

          {/* Container for the text field where the user can add the group name */}

          <View>
            <Input variant="big" placeholder="Gruppenname"></Input>
            <Text
              className="px-[15px] pt-[15px] text-neutral-600"
              variant="caption"
            >
              {APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_GROUP_NAME_INFO}
            </Text>
          </View>

          {/* Container for the text field where the user can add the group description */}

          <View>
            <Input variant="normal" placeholder="Gruppenbeschreibung"></Input>
            <Text
              className="px-[15px] pt-[15px] text-neutral-600"
              variant="caption"
            >
              {APPLICATION_CONSTANTS.CREATE_CHAT_MODAL_GROUP_DESCRIPTION_INFO}
            </Text>
          </View>

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
        <ScrollView
          contentContainerStyle={{
            gap: 10,
            paddingTop: 40,
          }}
          className="px-[15px]"
        >
          {contacts.map((contact) => {
            return (
              <ThemedPressable
                key={contact.user_id}
                onPress={() => onContactPressed(contact.user_id)}
              >
                <ThemedListPreviewItem
                  borderRadius={18}
                  userId={contact.user_id}
                  heading={contact.display_name}
                  badges={contactBadges(contact)}
                  showChevron
                  className="bg-card shadow-md"
                  paddingVertical={15}
                  paddingHorizontal={15}
                />
              </ThemedPressable>
            );
          })}
        </ScrollView>
      )}
    </ThemedModal>
  );
};

export default ThemedCreateChatModal;
