import type { ColorToken } from '@/shared/theme';
import { AppText, Card, Column, Icon, Row, type TextTone } from '@/shared/ui';

import type { TAccountSide } from '../../domain/entities/TopicSession';
import { parseTAccountItem } from './tAccountItem';

// DEBE en verde, HABER en cian; los aumentos del DEBE en verde y los del HABER en blanco (captura).
const sides = {
  debit: { title: 'DEBE', color: 'primary', plusTone: 'primary', plusIcon: 'primary' },
  credit: { title: 'HABER', color: 'accent', plusTone: 'default', plusIcon: 'white' },
} as const satisfies Record<
  string,
  { title: string; color: ColorToken; plusTone: TextTone; plusIcon: ColorToken }
>;

type TAccountColumnProps = {
  kind: keyof typeof sides;
  side: TAccountSide;
};

/** Un lado de la Cuenta T: título con punto de color, etiqueta y movimientos con +/−. */
export function TAccountColumn({ kind, side }: TAccountColumnProps) {
  const style = sides[kind];
  return (
    <Card grow padding="md">
      <Column gap="sm">
        <Column gap="xs">
          <Row gap="sm">
            <Icon name="circle" color={style.color} size="xs" />
            <AppText variant="subtitle" weight="bold" tone={style.color}>
              {style.title}
            </AppText>
          </Row>
          <AppText variant="caption" tone="default" weight="semibold">
            {side.label}
          </AppText>
        </Column>
        <Column gap="xs">
          {side.items.map((raw) => {
            const item = parseTAccountItem(raw);
            const isPlus = item.sign === 'plus';
            return (
              <Row key={raw} gap="sm" align="start">
                {item.sign && (
                  <Icon
                    name={isPlus ? 'plus-circle-outline' : 'minus-circle-outline'}
                    color={isPlus ? style.plusIcon : 'muted'}
                  />
                )}
                <Column grow>
                  <AppText tone={isPlus ? style.plusTone : 'muted'}>{item.text}</AppText>
                </Column>
              </Row>
            );
          })}
        </Column>
      </Column>
    </Card>
  );
}
