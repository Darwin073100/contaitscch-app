import { Text, View } from 'react-native';
import { tv } from 'tailwind-variants';

import { Icon } from './Icon';

const banner = tv({
  slots: {
    container: 'gap-1.5 rounded-[20px] p-[18px]',
    title: 'flex-1 font-extrabold text-[21px]',
    text: 'text-[15px] leading-[22px]',
  },
  variants: {
    correct: {
      true: { container: 'bg-ok', title: 'text-ok-ink', text: 'text-ok-ink' },
      false: { container: 'bg-err', title: 'text-err-ink', text: 'text-err-ink' },
    },
  },
});

type FeedbackBannerProps = { correct: boolean; title: string; text: string };

/** Resultado de "Comprobar": verde si acertó, rojo si no. Se anuncia a lectores de pantalla. */
export function FeedbackBanner({ correct, title, text }: FeedbackBannerProps) {
  const s = banner({ correct });
  return (
    <View className={s.container()} accessibilityLiveRegion="polite" accessible>
      <View className="flex-row items-center gap-2.5">
        <Icon
          name={correct ? 'check-circle' : 'close-circle'}
          color={correct ? 'ok-ink' : 'err-ink'}
          size="xl"
        />
        <Text className={s.title()}>{title}</Text>
      </View>
      <Text className={s.text()}>{text}</Text>
    </View>
  );
}
