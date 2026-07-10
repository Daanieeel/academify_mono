export const C = {
  primary: '#6b3314',
  primaryFg: '#faf6ef',
  secondary: '#dcd9cc',
  foreground: '#27231c',
  background: '#f6f4ef',
} as const;

export interface Message {
  readonly id: number;
  readonly side: 'left' | 'right';
  readonly text: string;
  readonly highlight?: boolean;
}

export const MESSAGES: readonly Message[] = [
  { id: 0, side: 'left', text: 'Noch ein\nSchulmessenger?' },
  { id: 1, side: 'right', text: 'Ja. Aber hier kommen\nNachrichten auch an.' },
  { id: 2, side: 'left', text: 'Ernsthaft?' },
  {
    id: 3,
    side: 'right',
    text: 'Endlich einer,\nder zuhört.',
    highlight: true,
  },
] as const;

export const SEQ = {
  bubble0: 560,
  typing1: 1080,
  bubble1: 2080,
  typing2: 2640,
  bubble2: 3200,
  typing3: 3720,
  bubble3: 4440,
} as const;
