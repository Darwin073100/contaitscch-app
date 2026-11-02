import type { IconName } from '@/shared/ui';

import type { ContentBlock, TopicSession } from '../../domain/entities/TopicSession';

// Textos ya armados para la vista del paso actual: la pantalla y los componentes solo pintan.
export type TopicStepVm = {
  headerTitle: string;
  /** "Módulo 1 • Tema 4". */
  badge: string;
  /** "Paso 2 de 4". */
  stepLabel: string;
  progress: number;
  /** "+5 XP"; null en repaso (ya no da XP). */
  rewardLabel: string | null;
  rewardAccessibilityLabel: string | null;
  title: string;
  blocks: ContentBlock[];
  canGoBack: boolean;
  isLast: boolean;
  primaryLabel: string;
  primaryIcon: IconName;
};

/** `step` se recorta al rango válido. */
export function toTopicStepVm(session: TopicSession, step: number): TopicStepVm {
  const total = session.subtopics.length;
  const index = Math.min(Math.max(step, 0), total - 1);
  const subtopic = session.subtopics[index];
  const isLast = index === total - 1;
  const reward = session.xpReward > 0 ? session.xpReward : null;

  return {
    headerTitle: session.topic.title,
    badge: `Módulo ${session.level.sortOrder} • Tema ${session.topic.sortOrder}`,
    stepLabel: `Paso ${index + 1} de ${total}`,
    progress: (index + 1) / total,
    rewardLabel: reward ? `+${reward} XP` : null,
    rewardAccessibilityLabel: reward ? `Completa el tema para ganar ${reward} XP` : null,
    title: subtopic.title,
    blocks: subtopic.blocks,
    canGoBack: index > 0,
    isLast,
    primaryLabel: isLast ? (session.completed ? 'Terminar repaso' : 'Completar tema') : 'Continuar',
    primaryIcon: isLast ? 'check-bold' : 'arrow-right',
  };
}
