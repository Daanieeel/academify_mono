import { useThemeColor } from '@/hooks/use-theme-color';
import { View, StyleSheet } from 'react-native';
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
    <View style={[styles.container, { backgroundColor: neutral100Color }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <IcomoonIcon size={24} name={props.icomoonIcon}></IcomoonIcon>
          <ThemedText type="caption">{props.title}</ThemedText>
        </View>
      </View>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 18,
    flexDirection: 'column',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});

export default ThemedBentoBox;
