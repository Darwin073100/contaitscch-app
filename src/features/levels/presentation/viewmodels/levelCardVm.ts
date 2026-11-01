import type { IconName } from '@/shared/ui';

import type { LevelOverviewItem, LevelStatus } from '../../domain/entities/Level';

export type UnlockHintVm = {
  text: string;
  /** `next`: es el siguiente en abrirse (aviso cian); `later`: falta más de un nivel (aviso tenue). */
  emphasis: 'next' | 'later';
};

export type LevelCardVm = {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  icon: IconName;
  status: LevelStatus;
  statusLabel: string;
  topicsLabel: string;
  progress: number;
  progressLabel: string;
  actionLabel: string;
  unlockHint?: UnlockHintVm;
  accessibilityLabel: string;
};

// Iconos de la captura por orden del nivel; un nivel nuevo usa el birrete.
const levelIcons: Record<number, IconName> = {
  1: 'bank-outline',
  2: 'calculator-variant-outline',
  3: 'receipt-text-outline',
};

const statusLabel: Record<LevelStatus, string> = {
  completed: 'Completado',
  inProgress: 'En curso',
  locked: 'Bloqueado',
};

function actionLabel(level: LevelOverviewItem): string {
  if (level.status === 'locked') return 'Bloqueado';
  if (level.status === 'completed') return 'Repasar Nivel';
  return level.completedTopics > 0 ? 'Continuar Nivel' : 'Empezar Nivel';
}

function unlockHint(
  level: LevelOverviewItem,
  previous: LevelOverviewItem | undefined,
): UnlockHintVm | undefined {
  if (level.status !== 'locked' || !previous) return undefined;
  return previous.status === 'locked'
    ? {
        text: `Desbloquea completando satisfactoriamente el Nivel ${previous.name}.`,
        emphasis: 'later',
      }
    : {
        text: `Requiere aprobar el Test de Nivel ${previous.name} para desbloquear.`,
        emphasis: 'next',
      };
}

/** `previous` es el nivel anterior en orden (para el aviso de desbloqueo). */
export function toLevelCardVm(level: LevelOverviewItem, previous?: LevelOverviewItem): LevelCardVm {
  const percent = Math.round(level.progress * 100);
  const name = `Nivel ${level.name}`;
  return {
    id: level.id,
    name,
    subtitle: level.subtitle,
    description: level.description,
    icon: levelIcons[level.sortOrder] ?? 'school-outline',
    status: level.status,
    statusLabel: statusLabel[level.status],
    topicsLabel: `${level.completedTopics}/${level.totalTopics} Temas`,
    progress: level.progress,
    progressLabel: `${percent}% Completado`,
    actionLabel: actionLabel(level),
    unlockHint: unlockHint(level, previous),
    accessibilityLabel: `${name}, ${level.subtitle}. ${statusLabel[level.status]}, ${percent}% completado`,
  };
}
