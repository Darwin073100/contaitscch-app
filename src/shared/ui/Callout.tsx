import { Text, View } from 'react-native';
import { tv, type VariantProps } from 'tailwind-variants';

import type { ColorToken } from '../theme';
import { Icon, type IconName } from './Icon';
import { IconBox, type IconBoxTone } from './IconBox';
import { RichText } from './RichText';

// Aviso o bloque destacado: idea clave, error común, actividad, "Se desbloquea al aprobar…", errores.
const callout = tv({
  slots: {
    container: 'flex-row gap-3.5',
    title: 'font-extrabold text-base text-text',
  },
  variants: {
    variant: {
      plain: { container: 'items-start' },
      boxed: { container: 'items-start rounded-[20px] p-4' },
    },
    tone: {
      accent: {},
      amber: {},
      danger: {},
      muted: {},
    },
  },
  compoundVariants: [
    { variant: 'boxed', tone: 'accent', class: { container: 'bg-accent/10' } },
    { variant: 'boxed', tone: 'amber', class: { container: 'bg-amber/15' } },
    { variant: 'boxed', tone: 'danger', class: { container: 'bg-err/10' } },
    { variant: 'boxed', tone: 'muted', class: { container: 'border-2 border-dashed border-line' } },
  ],
  defaultVariants: { variant: 'boxed', tone: 'accent' },
});

type CalloutVariants = VariantProps<typeof callout>;
type CalloutTone = NonNullable<CalloutVariants['tone']>;

const iconColor: Record<CalloutTone, ColorToken> = {
  accent: 'accent',
  amber: 'amber-text',
  danger: 'err',
  muted: 'dim',
};
const iconBoxTone: Record<CalloutTone, IconBoxTone> = {
  accent: 'accent',
  amber: 'amberSolid',
  danger: 'danger',
  muted: 'accent',
};
const plainTextTone = {
  accent: 'accent',
  amber: 'amber',
  danger: 'danger',
  muted: 'muted',
} as const;

type CalloutProps = CalloutVariants & {
  /** Admite negritas `**así**`. */
  text: string;
  title?: string;
  icon?: IconName;
};

export function Callout({ text, title, icon, variant = 'boxed', tone = 'accent' }: CalloutProps) {
  const s = callout({ variant, tone });
  // En "plain" el texto toma el color del tono; en "boxed" el cuerpo va atenuado bajo el título.
  const plain = variant === 'plain';
  return (
    <View className={s.container()} accessible accessibilityRole="text">
      {icon &&
        (plain ? (
          <Icon name={icon} color={iconColor[tone]} />
        ) : (
          <IconBox icon={icon} tone={iconBoxTone[tone]} size="md" />
        ))}
      <View className="flex-1 gap-1">
        {title && <Text className={s.title()}>{title}</Text>}
        <RichText
          text={text}
          variant={plain ? 'caption' : 'body'}
          tone={plain ? plainTextTone[tone] : 'muted'}
          weight={plain ? 'semibold' : undefined}
          emphasisTone={plain ? plainTextTone[tone] : 'default'}
        />
      </View>
    </View>
  );
}
