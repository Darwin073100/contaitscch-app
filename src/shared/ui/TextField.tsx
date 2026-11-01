import { useState, type ComponentRef, type Ref } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { tv } from 'tailwind-variants';

import { colors } from '../theme';
import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';

const field = tv({
  slots: {
    label: 'font-semibold text-sm text-white',
    box: 'h-14 flex-row items-center gap-2 rounded-2xl border-2 bg-surface px-4',
    input: 'flex-1 font-sans text-base text-white',
    helper: 'text-xs',
  },
  variants: {
    state: {
      idle: { box: 'border-transparent', helper: 'text-muted' },
      focused: { box: 'border-primary', helper: 'text-muted' },
      error: { box: 'border-danger', helper: 'text-danger' },
    },
  },
  defaultVariants: { state: 'idle' },
});

type TextFieldProps = Omit<TextInputProps, 'className' | 'placeholderTextColor'> & {
  label: string;
  /** Mensaje de error (por ejemplo `fieldState.error?.message` de React Hook Form). */
  error?: string;
  hint?: string;
  leftIcon?: IconName;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

/** Campo de formulario. Con `secureTextEntry` muestra el botón para ver/ocultar la contraseña. */
export function TextField({
  label,
  error,
  hint,
  leftIcon,
  secureTextEntry,
  onFocus,
  onBlur,
  ref,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const s = field({ state: error ? 'error' : focused ? 'focused' : 'idle' });
  const helper = error ?? hint;

  return (
    <View className="gap-1.5">
      <Text className={s.label()}>{label}</Text>
      <View className={s.box()}>
        {leftIcon && <Icon name={leftIcon} color={error ? 'danger' : 'muted'} />}
        <TextInput
          ref={ref}
          className={s.input()}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry && hidden}
          accessibilityLabel={label}
          accessibilityHint={helper}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {secureTextEntry && (
          <IconButton
            icon={hidden ? 'eye-outline' : 'eye-off-outline'}
            variant="ghost"
            size="sm"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((h) => !h)}
          />
        )}
      </View>
      {helper && (
        <Text className={s.helper()} accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {helper}
        </Text>
      )}
    </View>
  );
}
