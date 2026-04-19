
import ProfilePic from '@/components/profile-pic'
import { ThemedText } from '@/components/themed-text'
import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { StyleSheet, View } from 'react-native'


export type ThemedChatPreviewProps = {
  chatName: string,
  chatIcon?: string,
  lastMessageTime?: string,
  lastMessage?: string,
  lastMessageType: 'text' | 'video' | 'audio' | 'file',
  read: boolean
}

const ThemedChatPreview = ({ lastMessageType = 'text', read = true, ...props }: ThemedChatPreviewProps) => {
  var lastMessageEmoji;

  const primaryColor = useThemeColor({}, 'neutral-900')
  const secondaryColor = read ? useThemeColor({}, 'neutral-500') : useThemeColor({}, 'neutral-900')
  const red500Color = useThemeColor({}, 'red-500')

  switch (lastMessageType) {
    case 'audio':
      lastMessageEmoji = '🎧'
      break;
    case 'video':
      lastMessageEmoji = '🎥'
      break;
    case 'file':
      lastMessageEmoji = '📃'
      break;
    case 'text':
      lastMessageEmoji = ''
      break;
  }


  return (
    <View style={styles['main-container']}>
      <ProfilePic size={'medium'} source={props.chatIcon}>
      </ProfilePic>
      <View style={styles['text-container']}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <ThemedText
            numberOfLines={1}
            type='body'
            color={primaryColor}
          >
            {props.chatName}
          </ThemedText>

          {/* Last message + unread badge */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5
          }}>
            <ThemedText
              numberOfLines={1}
              type='caption'
              color={secondaryColor}
            >
              {props.lastMessageTime ?? ''}
            </ThemedText>
            {read == true ? null : <View style={[styles['unread-badge'], { backgroundColor: red500Color }]}></View>}
          </View>
          {/* Last message + unread badge */}

        </View>
        <ThemedText
          numberOfLines={2}
          type='caption'
          color={secondaryColor}
        >
          {lastMessageEmoji + ' ' + props.lastMessage}
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  'main-container': {
    height: 80,
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    gap: 15,
  },
  'text-container': {
    gap: 10,
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-start',
  },
  'unread-badge': {
    width: 5,
    height: 5,
    borderRadius: 9999
  }
})

export default ThemedChatPreview
