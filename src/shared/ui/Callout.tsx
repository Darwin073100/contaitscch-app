import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';
import { IconBox } from './IconBox';
import { RichText } from './RichText';

// Aviso o bloque destacado: "Regla de Oro", "Requiere aprobar el Test…", mensajes de error.
const callout = tv({
  slots: {
    container: 'flex-row gap-3',
    title: 'font-display text-base',
  },
  variants: {
    variant: {
      plain: { container: 'items-center' },
      boxed: { container: 'items-start rounded-3xl bg-surface p-4' },
    },
    tone: {
      accent: { title: 'text-accent' },
      primary: { title: 'text-primary' },
      muted: { title: 'text-muted' },
      danger: { title: 'text-danger' },
    },
  },
  defaultVariants: { variant: 'boxed', tone: 'accent' },
});

type CalloutVariants = VariantProps<typeof callout>;
type CalloutTone = NonNullable<CalloutVariants['tone']>;

const iconColor: Record<CalloutTone, ColorToken> = {
  accent: 'accent',
  primary: 'primary',
  muted: 'muted',
  danger: 'danger',
};
const iconBoxTone = {
  accent: 'accentSoft',
  primary: 'primarySoft',
  muted: 'neutral',
  danger: 'neutral',
} as const;

type CalloutProps = CalloutVariants & {
  /** Admite negritas `**así**`. */
  text: string;
  title?: string;
  icon?: IconName;
};

export function Callout({ text, title, icon, variant = 'boxed', tone = 'accent' }: CalloutProps) {
  const s = callout({ variant, tone });
  // En "plain" el texto toma el color del tono; en "boxed" el cuerpo va en blanco y el título en color.
  const bodyTone = variant === 'plain' ? tone : 'default';
  return (
    <View className={s.container()} accessible accessibilityRole="text">
      {icon &&
        (variant === 'boxed' ? (
          <IconBox icon={icon} tone={iconBoxTone[tone]} size="md" />
        ) : (
          <Icon name={icon} color={iconColor[tone]} />
        ))}
      <View className="flex-1 gap-1">
        {title && <Text className={s.title()}>{title}</Text>}
        <RichText
          text={text}
          variant={variant === 'plain' ? 'caption' : 'body'}
          tone={bodyTone}
          weight={variant === 'plain' ? 'semibold' : undefined}
          emphasisTone={bodyTone}
        />
      </View>
    </View>
  );
}
