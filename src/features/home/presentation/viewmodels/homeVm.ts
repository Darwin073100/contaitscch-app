import type { UserProfile } from '@/features/auth';
import type { CourseProgress } from '@/features/learning';
import { toLevelCardVm, type LevelCardVm, type LevelsOverview } from '@/features/levels';
import type { FinalExamStatus } from '@/features/quizzes';
import type { IconName } from '@/shared/ui';

import type { Tip } from '../content/tips';

// Textos ya armados para la pestaña Niveles (inicio): la vista solo pinta.

export type HomeVm = {
  greeting: { overline: string; title: string; subtitle: string };
  stats: { icon: IconName; value: string; label: string }[];
  /** "Tu siguiente tema" / "Vuelve a tomar este tema"; null si ya aprobó todos. */
  next: {
    overline: string;
    title: string;
    actionLabel: string;
    actionIcon: IconName;
    retry: boolean;
    topicId: number;
  } | null;
  course: {
    progress: number;
    percentLabel: string;
    doneLabel: string;
    remainingLabel: string;
  };
  levelsLabel: string;
  levels: LevelCardVm[];
  exam: { unlocked: boolean; title: string; detail: string; canTake: boolean };
  tip: Tip;
};

const examLabels: Record<FinalExamStatus['status'], string> = {
  locked: 'Bloqueado',
  available: 'Disponible',
  pending: 'Por aprobar',
  passed: 'Aprobado',
};

export type HomeData = {
  user: UserProfile | null;
  course: CourseProgress;
  levels: LevelsOverview;
  exam: FinalExamStatus;
  tip: Tip;
};

export function toHomeVm({ user, course, levels, exam, tip }: HomeData): HomeVm {
  const { passedCount: done, totalCount: total, nextLesson } = course;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const retry = nextLesson?.state === 'retry';
  const unlocked = exam.status !== 'locked';

  return {
    greeting: {
      overline: 'Portal académico ITSCH',
      title: user ? `Hola, ${user.firstName}` : 'Hola',
      subtitle: 'Sigue con tu ruta de contabilidad.',
    },
    stats: [
      { icon: 'check-circle-outline', value: `${done}/${total}`, label: 'Temas aprobados' },
      {
        icon: 'school-outline',
        value: `${levels.currentLevel.sortOrder} de ${levels.levels.length}`,
        label: 'Nivel actual',
      },
      { icon: 'medal-outline', value: examLabels[exam.status], label: 'Examen final' },
    ],
    next: nextLesson
      ? {
          overline: `${retry ? 'Vuelve a tomar este tema' : 'Tu siguiente tema'} · Nivel ${nextLesson.levelOrder}`,
          title: nextLesson.title,
          actionLabel: retry ? 'Retomar lección' : done > 0 ? 'Continuar' : 'Empezar',
          actionIcon: retry ? 'replay' : 'arrow-right',
          retry,
          topicId: nextLesson.topicId,
        }
      : null,
    course: {
      progress: total > 0 ? done / total : 0,
      percentLabel: `${percent}%`,
      doneLabel: `${done} de ${total} temas`,
      remainingLabel: `${total - done} por aprobar`,
    },
    levelsLabel: `${levels.levels.length} niveles · ${total} temas`,
    levels: levels.levels.map((level, i) => toLevelCardVm(level, levels.levels[i - 1])),
    exam: {
      unlocked,
      title: `${exam.total} preguntas de toda la ruta`,
      detail: unlocked
        ? `Se aprueba con ${exam.passMark} de ${exam.total}.` +
          (exam.bestScore !== null ? ` Mejor resultado: ${exam.bestScore}/${exam.total}.` : '')
        : `Se desbloquea cuando apruebes los ${total} temas. Llevas ${done}.`,
      canTake: unlocked,
    },
    tip,
  };
}
