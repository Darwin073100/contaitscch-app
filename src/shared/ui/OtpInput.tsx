import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { tv } from 'tailwind-variants';

const cell = tv({
  slots: {
    box: 'h-16 flex-1 items-center justify-center rounded-xl border-2 bg-surface',
    digit: 'font-display text-2xl text-primary',
  },
  variants: {
    state: {
      idle: { box: 'border-transparent' },
      active: { box: 'border-primary' },
      error: { box: 'border-danger', digit: 'text-danger' },
    },
  },
  defaultVariants: { state: 'idle' },
});

type OtpInputProps = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  /** Marca las casillas en rojo (código incorrecto). */
  error?: boolean;
  autoFocus?: boolean;
  editable?: boolean;
};

/**
 * Código de verificación de N dígitos. Un TextInput invisible cubre las casillas: así funcionan
 * pegar, autocompletar desde el correo/SMS y borrar con el teclado del sistema.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error = false,
  autoFocus = false,
  editable = true,
}: OtpInputProps) {
  const [focused, setFocused] = useState(autoFocus);
  const digits = value.slice(0, length);

  return (
    <View className="relative flex-row gap-2">
      {Array.from({ length }, (_, i) => {
        const isActive = focused && i === Math.min(digits.length, length - 1);
        const s = cell({ state: error ? 'error' : isActive ? 'active' : 'idle' });
        return (
          <View key={i} className={s.box()}>
            <Text className={s.digit()}>{digits[i] ?? ''}</Text>
          </View>
        );
      })}
      <TextInput
        className="absolute inset-0 opacity-0"
        value={digits}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        editable={editable}
        caretHidden
        accessibilityLabel="Código de verificación"
        accessibilityHint={`Escribe los ${length} dígitos que enviamos a tu correo`}
      />
    </View>
  );
}
