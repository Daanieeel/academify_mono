import { useThemeColor } from '@/hooks/use-theme-color';
import { View } from 'react-native';
import IcomoonIcon from './IcomoonIcon';
import { ThemedText } from './themed-text';

export type ThemedBentoBoxProps = {
  title: string;
  children?: React.ReactNode;
  icomoonIcon: string;
};

const ThemedBentoBox = (props: ThemedBentoBoxProps) => {
  const neutral100Color = useThemeColor({}, 'neutral-100');

  return (
    <View
      style={{
        width: '100%',
        borderRadius: 18,
        backgroundColor: neutral100Color,
        flexDirection: 'column',
      }}
    >
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <IcomoonIcon size={24} name={props.icomoonIcon}></IcomoonIcon>
          <ThemedText type="caption">{props.title}</ThemedText>
        </View>
      </View>
      {props.children}
    </View>
  );
};

export default ThemedBentoBox;
