import { View } from 'react-native';
import { tv } from 'tailwind-variants';

import { Icon, type IconName } from './Icon';

const seal = tv({
  base: 'h-[120px] w-[120px] items-center justify-center rounded-full border-b-8',
  variants: {
    passed: {
      true: 'border-accent-rim bg-accent',
      false: 'border-[3px] border-b-8 border-err bg-surface',
    },
  },
});

type SealProps = { passed: boolean; icon: IconName };

/** Sello grande del resultado: aprobado (verde azulado) o por aprobar (borde rojo). */
export function Seal({ passed, icon }: SealProps) {
  return (
    <View className={seal({ passed })} accessibilityElementsHidden>
      <Icon name={icon} color={passed ? 'accent-ink' : 'err'} size="2xl" />
    </View>
  );
}
