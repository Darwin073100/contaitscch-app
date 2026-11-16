import type { CourseProgress, LevelState } from '../../domain/entities/CourseProgress';
import type { ExamStatus, Syllabus, SyllabusTopic } from '../../domain/entities/Syllabus';

// Textos ya armados para la pestaña Aprender: la pantalla y los componentes solo pintan.

/** Estado visual del nodo: `retry` es un tema activo reprobado (se vuelve a tomar). */
export type NodeStatus = 'completed' | 'active' | 'retry' | 'locked';

export type LevelTabVm = {
  id: number;
  label: string;
  state: LevelState;
  selected: boolean;
  accessibilityLabel: string;
};

export type TopicNodeVm = {
  id: number;
  label: string;
  status: NodeStatus;
  /** Globo sobre el tema activo: "Empieza aquí", "Toca para continuar", "Vuelve a tomarla". */
  hint?: string;
  accessibilityLabel: string;
};

/** Meta al final de la ruta: abre el siguiente nivel o, en el último, el examen integrador. */
export type GoalNodeVm = {
  title: string;
  caption: string;
  status: ExamStatus;
  target: { kind: 'level'; levelId: number } | { kind: 'exam' };
  accessibilityLabel: string;
};

export type ContinueActionVm = {
  caption: string;
  title: string;
  actionLabel: string;
  retry: boolean;
  target: { kind: 'topic'; topicId: number } | { kind: 'exam' };
};

export type SyllabusMapVm = {
  levelTabs: LevelTabVm[];
  header: {
    overline: string;
    levelName: string;
    title: string;
    description: string;
    progress: number;
    progressLabel: string;
    percentLabel: string;
  };
  nodes: TopicNodeVm[];
  goal: GoalNodeVm;
  /** Barra fija inferior: el siguiente tema de todo el curso; null si ya no hay pendientes. */
  continueAction: ContinueActionVm | null;
};

const statusText: Record<NodeStatus, string> = {
  completed: 'Aprobado',
  active: 'Desbloqueado',
  retry: 'Por aprobar',
  locked: 'Bloqueado',
};

/** "La cuenta y el catálogo (repaso)" → "La cuenta y el catálogo" (etiquetas cortas de la ruta). */
export function shortTitle(title: string): string {
  const clean = title.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const head = clean.split(':')[0].trim();
  return head.length > 64 ? `${head.slice(0, 62).trim()}…` : head;
}

function toNode(topic: SyllabusTopic, anyCompleted: boolean): TopicNodeVm {
  const status: NodeStatus = topic.retry ? 'retry' : topic.status;
  const hint =
    status === 'retry'
      ? 'Vuelve a tomarla'
      : status === 'active'
        ? anyCompleted
          ? 'Toca para continuar'
          : 'Empieza aquí'
        : undefined;
  return {
    id: topic.id,
    label: `${topic.sortOrder}. ${shortTitle(topic.title)}`,
    status,
    hint,
    accessibilityLabel: `Tema ${topic.sortOrder}: ${topic.title}. ${statusText[status]}`,
  };
}

function toGoal(syllabus: Syllabus, isLastLevel: boolean): GoalNodeVm {
  const order = syllabus.level.sortOrder;
  const done = syllabus.examStatus === 'passed';
  const title = isLastLevel ? 'Examen integrador final' : `Fin del Nivel ${order}`;
  const caption = !done
    ? `Aprueba los ${syllabus.totalTopics} temas`
    : isLastLevel
      ? 'Toca para presentarlo'
      : `Toca para abrir el Nivel ${order + 1}`;
  return {
    title,
    caption,
    // Con el nivel aprobado la meta está abierta; aún sin aprobar, bloqueada
    status: done ? 'available' : 'locked',
    target: isLastLevel ? { kind: 'exam' } : { kind: 'level', levelId: syllabus.level.id + 1 },
    accessibilityLabel: `${title}. ${caption}`,
  };
}

function toContinue(course: CourseProgress): ContinueActionVm | null {
  const next = course.nextLesson;
  if (next) {
    const retry = next.state === 'retry';
    return {
      caption: `${retry ? 'Por aprobar' : 'Tema actual'} · Nivel ${next.levelOrder}`,
      title: shortTitle(next.title),
      actionLabel: retry ? 'Retomar' : 'Estudiar',
      retry,
      target: { kind: 'topic', topicId: next.topicId },
    };
  }
  if (course.finalExamUnlocked) {
    return {
      caption: 'Aprobaste los 24 temas',
      title: 'Examen integrador final',
      actionLabel: 'Presentar',
      retry: false,
      target: { kind: 'exam' },
    };
  }
  return null;
}

export function toSyllabusMapVm(syllabus: Syllabus, course: CourseProgress): SyllabusMapVm {
  const { level, completedTopics, totalTopics } = syllabus;
  const progress = totalTopics > 0 ? completedTopics / totalTopics : 0;
  const levelName = `Nivel ${level.sortOrder}`;
  const lastLevelId = course.levels.at(-1)?.levelId;

  return {
    levelTabs: course.levels.map((l) => ({
      id: l.levelId,
      label: `Nivel ${l.levelOrder}`,
      state: l.state,
      selected: l.levelId === level.id,
      accessibilityLabel: `Nivel ${l.levelOrder}, ${
        l.state === 'done' ? 'aprobado' : l.state === 'current' ? 'abierto' : 'bloqueado'
      }`,
    })),
    header: {
      overline: levelName,
      levelName: `${totalTopics} temas`,
      title: level.title,
      description: level.description,
      progress,
      progressLabel: `${completedTopics} de ${totalTopics} temas aprobados`,
      percentLabel: `${Math.round(progress * 100)}%`,
    },
    nodes: syllabus.topics.map((t) => toNode(t, completedTopics > 0)),
    goal: toGoal(syllabus, level.id === lastLevelId),
    continueAction: toContinue(course),
  };
}
