import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { TextInput, View } from 'react-native';

export type InputProps = React.ComponentProps<typeof TextInput> & {
  fieldDescription?: string;
  obscureText?: boolean;
  isEditable?: boolean;
  heightBased?: number;
  variant?: 'normal' | 'big';
  containerClassName?: string;
  ref?: React.Ref<TextInput> | undefined;
};

export function Input({
  variant = 'normal',
  obscureText,
  isEditable = true,
  fieldDescription,
  containerClassName,
  className,
  ref,
  ...props
}: InputProps) {
  return (
    <View
      className={cn(
        'px-[15px] rounded-[16px] justify-center bg-neutral-200 gap-[10px]',
        props.heightBased !== null && props.heightBased !== undefined
          ? 'py-0'
          : 'py-[15px]',
        containerClassName,
      )}
      style={{
        height: props.heightBased,
      }}
    >
      {fieldDescription && (
        <Text className="text-neutral-900" variant="caption">
          {fieldDescription}
        </Text>
      )}
      <TextInput
        ref={ref}
        editable={isEditable}
        secureTextEntry={obscureText}
        autoCapitalize="none"
        className={cn(
          'text-neutral-900 placeholder:text-neutral-500',
          variant === 'normal'
            ? 'text-[14px] p-0 leading-[17.3px] font-[MartianGrotesk-StdRg]'
            : 'font-[MartianGrotesk-NrBl] text-[36.65px] leading-[40.3px] tracking-[-0.2px] p-0',
          className,
        )}
        {...props}
      />
    </View>
  );
}
