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
    iconBox: 'primary',
    badge: { tone: 'primary', appearance: 'soft' },
    statusIcon: { name: 'check-decagram-outline', color: 'primary' },
    button: { variant: 'primary', rightIcon: 'play-outline' },
  },
  completed: {
    iconBox: 'primarySoft',
    badge: { tone: 'primary', appearance: 'solid' },
    statusIcon: { name: 'check-decagram', color: 'primary' },
    button: { variant: 'secondary', rightIcon: 'refresh' },
  },
  locked: {
    iconBox: 'neutral',
    badge: { tone: 'neutral', appearance: 'soft' },
    statusIcon: { name: 'lock-outline', color: 'muted' },
    button: { variant: 'locked', leftIcon: 'lock-outline' },
  },
} as const satisfies Record<LevelStatus, unknown>;

const hintStyle = {
  next: { variant: 'plain', tone: 'accent', icon: 'information-outline' },
  later: { variant: 'boxed', tone: 'muted', icon: 'lock-clock' },
} as const satisfies Record<UnlockHintVm['emphasis'], Omit<ComponentProps<typeof Callout>, 'text'>>;

type LevelCardProps = { level: LevelCardVm; onPress: () => void };

/** Tarjeta de nivel de la pantalla Niveles: en curso, completado o bloqueado. */
export function LevelCard({ level, onPress }: LevelCardProps) {
  const style = statusStyle[level.status];
  const locked = level.status === 'locked';

  return (
    <Card padding="lg" locked={locked}>
      <Column gap="lg">
        <Row align="start" gap="md">
          <IconBox icon={level.icon} tone={style.iconBox} size="lg" />
          <Column grow gap="xs">
            <Row gap="sm">
              <Badge label={level.statusLabel} uppercase {...style.badge} />
              {!locked && <AppText variant="caption">• {level.topicsLabel}</AppText>}
            </Row>
            <AppText variant="heading" accessibilityRole="header">
              {level.name}
            </AppText>
            <AppText tone="muted">{level.subtitle}</AppText>
          </Column>
          <Icon name={style.statusIcon.name} color={style.statusIcon.color} size="lg" />
        </Row>

        {!locked && (
          <>
            <AppText>{level.description}</AppText>
            <Column gap="sm">
              <Row justify="between">
                <AppText variant="caption">Progreso del Nivel</AppText>
                <AppText variant="caption" tone="primary" weight="bold">
                  {level.progressLabel}
                </AppText>
              </Row>
              <ProgressBar
                value={level.progress}
                accessibilityLabel={`Progreso del ${level.name}`}
              />
            </Column>
          </>
        )}

        {level.unlockHint && (
          <Callout text={level.unlockHint.text} {...hintStyle[level.unlockHint.emphasis]} />
        )}

        <Button
          label={level.actionLabel}
          onPress={onPress}
          accessibilityHint={level.accessibilityLabel}
          {...style.button}
        />
      </Column>
    </Card>
  );
}
