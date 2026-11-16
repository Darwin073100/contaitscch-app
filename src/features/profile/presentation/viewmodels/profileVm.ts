import type { UserProfile } from '@/features/auth';
import type { LevelsOverview } from '@/features/levels';
import type { FinalExamStatus, SyncStatus } from '@/features/quizzes';
import { getInitials } from '@/shared/utils';

import { toSyncStatusVm, type SyncStatusVm } from './syncStatusVm';

// Textos ya armados para la pestaña Perfil: la pantalla solo pinta.

export type ProfileVm = {
  card: { initials: string; name: string; email: string; place: string; levelLine: string };
  sync: SyncStatusVm;
  pendingCount: number;
  levels: { id: number; label: string; progress: number; count: string }[];
  examLine: string;
};

export type ProfileData = {
  user: UserProfile | null;
  levels: LevelsOverview;
  exam: FinalExamStatus;
  sync: SyncStatus;
};

function examLine(exam: FinalExamStatus, totalTopics: number): string {
  if (exam.bestScore === null) {
    return exam.status === 'locked'
      ? `Examen integrador: se desbloquea al aprobar los ${totalTopics} temas.`
      : 'Examen integrador: disponible, sin presentar.';
  }
  const passed = exam.status === 'passed' ? ' (aprobado)' : '';
  return `Examen integrador: mejor resultado ${exam.bestScore}/${exam.total}${passed}.`;
}

export function toProfileVm({ user, levels, exam, sync }: ProfileData, nowIso: string): ProfileVm {
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const { completedTopics, totalTopics } = levels.career;
  return {
    card: {
      initials: name ? getInitials(name) : 'TÚ',
      name,
      email: user?.email ?? '',
      place: user ? [user.city, user.state, user.country].filter(Boolean).join(', ') : '',
      levelLine: `Nivel ${levels.currentLevel.sortOrder} · ${completedTopics} de ${totalTopics} temas aprobados`,
    },
    sync: toSyncStatusVm(sync, nowIso),
    pendingCount: sync.pendingCount,
    levels: levels.levels.map((l) => ({
      id: l.id,
      label: `Nivel ${l.sortOrder}`,
      progress: l.progress,
      count: `${l.completedTopics}/${l.totalTopics}`,
    })),
    examLine: examLine(exam, totalTopics),
  };
}
