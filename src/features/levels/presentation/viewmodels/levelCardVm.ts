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

// Iconos por orden del nivel (equivalentes a los del prototipo); un nivel nuevo usa el birrete.
const levelIcons: Record<number, IconName> = {
  1: 'feather',
  2: 'scale-balance',
  3: 'book-open-variant',
  4: 'chart-line',
  5: 'storefront-outline',
  6: 'lightbulb-on-outline',
};

const statusLabel: Record<LevelStatus, string> = {
  completed: 'Aprobado',
  inProgress: 'En curso',
  locked: 'Bloqueado',
};

function actionLabel(level: LevelOverviewItem): string {
  if (level.status === 'locked') return 'Bloqueado';
  if (level.status === 'completed') return 'Repasar nivel';
  return level.completedTopics > 0 ? 'Continuar nivel' : 'Empezar nivel';
}

function unlockHint(
  level: LevelOverviewItem,
  previous: LevelOverviewItem | undefined,
): UnlockHintVm | undefined {
  if (level.status !== 'locked' || !previous) return undefined;
  return {
    text: `Se desbloquea al aprobar los ${previous.totalTopics} temas del Nivel ${previous.sortOrder}.`,
    emphasis: previous.status === 'locked' ? 'later' : 'next',
  };
}

/** `previous` es el nivel anterior en orden (para el aviso de desbloqueo). */
export function toLevelCardVm(level: LevelOverviewItem, previous?: LevelOverviewItem): LevelCardVm {
  const percent = Math.round(level.progress * 100);
  const name = `Nivel ${level.sortOrder}`;
  return {
    id: level.id,
    name,
    subtitle: level.title,
    description: level.description,
    icon: levelIcons[level.sortOrder] ?? 'school-outline',
    status: level.status,
    statusLabel: statusLabel[level.status],
    topicsLabel: `${level.completedTopics}/${level.totalTopics} temas`,
    progress: level.progress,
    progressLabel: `${percent}% aprobado`,
    actionLabel: actionLabel(level),
    unlockHint: unlockHint(level, previous),
    accessibilityLabel: `${name}, ${level.title}. ${statusLabel[level.status]}, ${percent}% aprobado`,
  };
}
