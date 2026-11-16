import type { ComponentProps } from 'react';

import {
  AppText,
  Badge,
  Button,
  Callout,
  Card,
  Column,
  Icon,
  IconBox,
  ProgressBar,
  Row,
} from '@/shared/ui';

import type { LevelStatus } from '../../domain/entities/Level';
import type { LevelCardVm, UnlockHintVm } from '../viewmodels/levelCardVm';

// Estado → props del kit (reemplaza condicionales de estilo).
const statusStyle = {
  inProgress: {
    iconBox: 'solid',
    badge: { tone: 'navy', appearance: 'solid' },
    statusIcon: { name: 'progress-clock', color: 'faint' },
    button: { variant: 'primary', rightIcon: 'arrow-right' },
  },
  completed: {
    iconBox: 'accent',
    badge: { tone: 'accent', appearance: 'soft', icon: 'check-circle' },
    statusIcon: { name: 'check-decagram', color: 'accent' },
    button: { variant: 'ghost', leftIcon: 'replay' },
  },
  locked: {
    iconBox: 'locked',
    badge: { tone: 'neutral', appearance: 'soft' },
    statusIcon: { name: 'lock', color: 'faint' },
    button: { variant: 'ghost', leftIcon: 'lock', disabled: true },
  },
} as const satisfies Record<LevelStatus, unknown>;

const hintStyle = {
  next: { variant: 'plain', tone: 'amber', icon: 'information-outline' },
  later: { variant: 'plain', tone: 'muted', icon: 'lock-clock' },
} as const satisfies Record<UnlockHintVm['emphasis'], Omit<ComponentProps<typeof Callout>, 'text'>>;

type LevelCardProps = { level: LevelCardVm; onPress: () => void };

/** Tarjeta de nivel de la pantalla Niveles: en curso, completado o bloqueado. */
export function LevelCard({ level, onPress }: LevelCardProps) {
  const style = statusStyle[level.status];
  const locked = level.status === 'locked';

  return (
    <Card tone={locked ? 'alt' : 'default'}>
      <Column gap="lg">
        <Row align="start" gap="md">
          <IconBox icon={level.icon} tone={style.iconBox} size="lg" />
          <Column grow gap="xs">
            <Row gap="sm">
              <Badge label={level.statusLabel} uppercase {...style.badge} />
              {!locked && <AppText variant="caption">• {level.topicsLabel}</AppText>}
            </Row>
            <AppText variant="heading" tone={locked ? 'faint' : 'title'} accessibilityRole="header">
              {level.name}
            </AppText>
            <AppText tone={locked ? 'faint' : 'muted'}>{level.subtitle}</AppText>
          </Column>
          <Icon name={style.statusIcon.name} color={style.statusIcon.color} size="lg" />
        </Row>

        {!locked && (
          <>
            <AppText variant="caption">{level.description}</AppText>
            <Column gap="sm">
              <Row justify="between">
                <AppText variant="caption">Temas aprobados</AppText>
                <AppText variant="caption" tone="default" weight="bold">
                  {level.progressLabel}
                </AppText>
              </Row>
              <ProgressBar
                value={level.progress}
                size="sm"
                accessibilityLabel={`Temas aprobados del ${level.name}: ${level.progressLabel}`}
              />
            </Column>
          </>
        )}

        {level.unlockHint && (
          <Callout text={level.unlockHint.text} {...hintStyle[level.unlockHint.emphasis]} />
        )}

        {!locked && (
          <Button
            label={level.actionLabel}
            onPress={onPress}
            accessibilityHint={level.accessibilityLabel}
            {...style.button}
          />
        )}
      </Column>
    </Card>
  );
}
