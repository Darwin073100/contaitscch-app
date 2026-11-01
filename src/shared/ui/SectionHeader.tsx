import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from './Icon';

type SectionHeaderProps = {
  title: string;
  icon?: IconName;
  /** Texto a la derecha: "3 Bloques", "Acerca de", "38 Estudiantes Registrados". */
  actionLabel?: string;
  /** Si existe, actionLabel se vuelve un enlace. */
  onActionPress?: () => void;
};

export function SectionHeader({ title, icon, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1 flex-row items-center gap-2">
        {icon && <Icon name={icon} color="primary" size="lg" />}
        <Text className="font-display text-xl text-white" accessibilityRole="header">
          {title}
        </Text>
      </View>
      {actionLabel &&
        (onActionPress ? (
          <Pressable
            onPress={onActionPress}
            accessibilityRole="link"
            hitSlop={12}
            className="active:opacity-70"
          >
            <Text className="font-display text-sm text-accent">{actionLabel}</Text>
          </Pressable>
        ) : (
          <Text className="max-w-[45%] text-right font-semibold text-xs text-muted">
            {actionLabel}
          </Text>
        ))}
    </View>
  );
}
