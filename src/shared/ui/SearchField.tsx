import { TextInput, View } from 'react-native';

import { useThemeColors } from '../theme';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  /** Lo anuncian los lectores de pantalla (no hay etiqueta visible). */
  accessibilityLabel: string;
};

/** Buscador con lupa y botón para borrar (glosario). */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: SearchFieldProps) {
  const colors = useThemeColors();
  return (
    <View className="min-h-[54px] flex-row items-center gap-2.5 rounded-xl border-2 border-line bg-surface-sunk pl-3.5 pr-1">
      <Icon name="magnify" color="faint" />
      <TextInput
        className="min-h-[50px] flex-1 font-sans text-base text-text"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        accessibilityLabel={accessibilityLabel}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <IconButton
          icon="close-circle"
          variant="ghost"
          size="sm"
          accessibilityLabel="Borrar búsqueda"
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}
