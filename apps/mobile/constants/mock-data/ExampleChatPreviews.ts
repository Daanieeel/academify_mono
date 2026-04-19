import { ThemedChatPreviewProps } from '@/components/chats/themed-chat-preview';

export const mockChats: ThemedChatPreviewProps[] = [
  {
    chatName: 'Alice',
    lastMessageTime: '09:41',
    lastMessage: 'See you later!',
    lastMessageType: 'text',
    read: true,
  },
  {
    chatName: 'Project Team',
    lastMessageTime: 'Yesterday',
    lastMessage: 'Final video uploaded',
    lastMessageType: 'video',
    read: false,
  },
  {
    chatName: 'Mom',
    lastMessageTime: '08:12',
    lastMessage:
      'Hallo, was geht bei euch, dies ist ein mehrere Zeilen Test, ob das auch richtig angezeigt wird.. Scheint gut auszusehen, und der Overfolow klappt auch.',
    lastMessageType: 'audio',
    read: false,
  },
  {
    chatName: 'Documents',
    lastMessageTime: 'Mon',
    lastMessage: 'Invoice_2026.pdf',
    lastMessageType: 'file',
    read: true,
  },
  {
    chatName: 'Bob',
    lastMessageType: 'text',
    read: false,
  },
  {
    chatName: 'Bob',
    lastMessageType: 'text',
    read: false,
  },
  {
    chatName: 'Bob',
    lastMessageType: 'text',
    read: false,
  },
  {
    chatName: 'Bob',
    lastMessageType: 'text',
    read: false,
  },
  {
    chatName: 'Bob',
    lastMessageType: 'text',
    read: false,
  },
];
