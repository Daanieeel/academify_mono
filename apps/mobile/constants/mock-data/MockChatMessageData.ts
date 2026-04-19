import { ThemedMessageWrapperProps } from '@/components/chat-page/message-components/themed-message-wrapper';

export const MOCK_MESSAGE_DATA: ThemedMessageWrapperProps[] = [
  {
    userIsSender: true,
    messageId: '0',
    textContent: { message: 'Hello, just a test message' },
    attachmentContents: [
      {
        attachmentFileType: '.PDF',
        attachmentName: 'Klassenliste.pdf',
        attachmentSize: '1.3 MB',
      },
    ],
    senderName: 'Linus',
    sendDate: '13:15',
    messageStatus: 'loading',
  },
  {
    userIsSender: false,
    messageId: '1',
    textContent: { message: 'Nice! Here are the screenshots.' },
    imageContent: {
      sources: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCtTwp9bSRc7VltVNvfhXkbJCS0Kc8b3jtA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCtTwp9bSRc7VltVNvfhXkbJCS0Kc8b3jtA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCtTwp9bSRc7VltVNvfhXkbJCS0Kc8b3jtA&s',
      ],
    },
    senderName: 'Anna',
    sendDate: '13:16',
    messageStatus: 'sent',
  },
  {
    userIsSender: false,
    messageId: '2',
    textContent: { message: 'Did you finish the React Native project?' },
    senderName: 'Anna',
    sendDate: '13:17',
    messageStatus: 'sent',
  },
  {
    userIsSender: true,
    messageId: '3',
    textContent: {
      message:
        'Almost done faslkdjfaslkdfjaslkdfjaslkdfjlaskdjflsadkfslkdfjaslfdjklsdjfaklsdfjslkdjföalsfjasöldjflökfajflakjdfaökjdsfödfjöasdfjasdlöfjaldksöfjlaskdj!',
    },
    imageContent: {
      sources: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCtTwp9bSRc7VltVNvfhXkbJCS0Kc8b3jtA&s',
      ],
    },
    senderName: 'Linus',
    sendDate: '13:18',
    messageStatus: 'sent',
  },
  {
    userIsSender: true,
    messageId: '4',
    textContent: { message: 'React Native keyboard handling is always fun 😅' },
    senderName: 'Linus',
    sendDate: '13:18',
    messageStatus: 'loading',
  },
  {
    userIsSender: false,
    messageId: '5',
    textContent: { message: 'Haha true!' },
    senderName: 'Anna',
    sendDate: '13:20',
    messageStatus: 'sent',
  },

  {
    userIsSender: true,
    messageId: '6',
    textContent: { message: 'I also tested sending attachments.' },
    attachmentContents: [
      {
        attachmentFileType: '.DOCX',
        attachmentName: 'MeetingNotes.docx',
        attachmentSize: '240 KB',
      },
    ],
    senderName: 'Linus',
    sendDate: '13:21',
    messageStatus: 'sent',
  },

  {
    userIsSender: false,
    messageId: '7',
    textContent: { message: 'Oh nice! Can you send the full design draft?' },
    senderName: 'Anna',
    sendDate: '13:22',
    messageStatus: 'sent',
  },

  {
    userIsSender: true,
    messageId: '8',
    textContent: { message: 'Sure, here it is.' },
    attachmentContents: [
      {
        attachmentFileType: '.ZIP',
        attachmentName: 'chat-ui-design.zip',
        attachmentSize: '8.7 MB',
      },
    ],
    senderName: 'Linus',
    sendDate: '13:23',
    messageStatus: 'loading',
  },

  {
    userIsSender: false,
    messageId: '9',
    textContent: { message: 'Thanks! Downloading it now.' },
    senderName: 'Anna',
    sendDate: '13:24',
    messageStatus: 'sent',
  },

  {
    userIsSender: false,
    messageId: '10',
    imageContent: {
      sources: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCtTwp9bSRc7VltVNvfhXkbJCS0Kc8b3jtA&s',
      ],
    },
    senderName: 'Anna',
    sendDate: '13:25',
    messageStatus: 'sent',
  },

  {
    userIsSender: true,
    messageId: '11',
    textContent: { message: 'That screenshot looks good actually.' },
    senderName: 'Linus',
    sendDate: '13:26',
    messageStatus: 'sent',
  },

  {
    userIsSender: true,
    messageId: '12',
    textContent: {
      message: 'Still tweaking the chat footer animation though.',
    },
    senderName: 'Linus',
    sendDate: '13:27',
    messageStatus: 'loading',
  },

  {
    userIsSender: false,
    messageId: '13',
    textContent: { message: 'Animations always take longer than expected 😄' },
    senderName: 'Anna',
    sendDate: '13:28',
    messageStatus: 'sent',
  },

  {
    userIsSender: false,
    messageId: '14',
    imageContent: {
      sources: [
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCtTwp9bSRc7VltVNvfhXkbJCS0Kc8b3jtA&s',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiCtTwp9bSRc7VltVNvfhXkbJCS0Kc8b3jtA&s',
      ],
    },
    senderName: 'Anna',
    sendDate: '13:29',
    messageStatus: 'sent',
  },

  {
    userIsSender: true,
    messageId: '15',
    textContent: {
      message: 'True. Especially with keyboard + FlatList interactions.',
    },
    senderName: 'Linus',
    sendDate: '13:30',
    messageStatus: 'sent',
  },

  {
    userIsSender: true,
    messageId: '16',
    attachmentContents: [
      {
        attachmentFileType: '.PNG',
        attachmentName: 'chat-preview.png',
        attachmentSize: '720 KB',
      },
    ],
    senderName: 'Linus',
    sendDate: '13:31',
    messageStatus: 'loading',
  },

  {
    userIsSender: false,
    messageId: '17',
    textContent: { message: 'Looks great already 👍' },
    senderName: 'Anna',
    sendDate: '13:32',
    messageStatus: 'sent',
  },
];
