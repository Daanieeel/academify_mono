import IcomoonIcon from '@/components/IcomoonIcon';
import ProfilePic from '@/components/profile-pic';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export type ThemedUserBadgeProps = {
  icomoonIconName: string;
  label: string;
};

const ThemedUserBadge = (props: ThemedUserBadgeProps) => {
  const primary900Color = useThemeColor({}, 'primary-900');
  const primary100Color = useThemeColor({}, 'primary-100');

  const uppercaseLabel = props.label.toUpperCase();

  return (
    <View
      style={{
        backgroundColor: primary900Color,
        paddingHorizontal: 5,
        borderRadius: 8,
        paddingVertical: 5,
        gap: 2,
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <IcomoonIcon
        name={props.icomoonIconName}
        color={primary100Color}
      ></IcomoonIcon>
      <ThemedText type="caption" color={primary100Color}>
        {uppercaseLabel}
      </ThemedText>
    </View>
  );
};

export type ThemedProfilePreviewProps = {
  username: string;
  firstName?: string;
  lastName?: string;
  badges: ThemedUserBadgeProps[];
  imageSource?: string;
};

const ThemedProfilePreview = ({
  firstName = '',
  lastName = '',
  ...props
}: ThemedProfilePreviewProps) => {
  const neutral100Color = useThemeColor({}, 'neutral-100');
  const neutral700Color = useThemeColor({}, 'neutral-700');
  const neutral400Color = useThemeColor({}, 'neutral-400');

  return (
    <View
      style={[styles['main-container'], { backgroundColor: neutral100Color }]}
    >
      <ProfilePic
        customBorderColor={neutral400Color}
        size="large"
        source={props.imageSource}
      ></ProfilePic>
      <View
        style={{
          gap: 0,
          alignItems: 'center',
        }}
      >
        <ThemedText type="subHeading">{firstName + ' ' + lastName}</ThemedText>
        <ThemedText color={neutral700Color} type="caption">
          {props.username}
        </ThemedText>
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
        }}
      >
        {props.badges.map((badgeProps, key) => (
          <ThemedUserBadge {...badgeProps} key={key}></ThemedUserBadge>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  'main-container': {
    width: '100%',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 15,
  },
});

export default ThemedProfilePreview;
