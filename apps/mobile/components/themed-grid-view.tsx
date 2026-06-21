import React, { useState } from 'react';
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native';

export type ThemedGridViewProps = {
  items: React.ReactNode[];
  itemWidth: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

const ThemedGridView = ({ gap = 10, ...props }: ThemedGridViewProps) => {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setWidth(width);
  };

  if (!width) {
    return <View onLayout={onLayout} />;
  }

  const itemsPerRow = Math.floor(width / (props.itemWidth + gap));

  const rows = [];
  for (let i = 0; i < props.items.length; i += itemsPerRow) {
    rows.push(props.items.slice(i, i + itemsPerRow));
  }

  return (
    <View onLayout={onLayout} style={[props.style, { gap: gap }]}>
      {rows.map((row, rowIndex) => {
        const isSparseRow = row.length < itemsPerRow;
        return (
          <View
            className={`flex-row ${isSparseRow ? 'justify-start' : 'justify-between'}`}
            key={rowIndex}
          >
            {row.map((item, i) => {
              return <View key={i}>{item}</View>;
            })}
          </View>
        );
      })}
    </View>
  );
};

export default ThemedGridView;
