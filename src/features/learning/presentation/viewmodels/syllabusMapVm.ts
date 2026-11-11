import type {
  ExamStatus,
  Syllabus,
  SyllabusTopic,
  TopicStatus,
} from '../../domain/entities/Syllabus';

// Textos ya armados para la vista: la pantalla y los componentes solo pintan.

export type TopicNodeVm = {
  id: number;
  label: string;
  status: TopicStatus;
  /** Globo sobre el tema activo: "¡Toca para empezar!" o "¡Vuelve a tomarla!". */
  hint?: string;
  accessibilityLabel: string;
};

export type ExamNodeVm = {
  title: string;
  caption: string;
  status: ExamStatus;
  accessibilityLabel: string;
};

export type ContinueActionVm = {
  caption: string;
  title: string;
  actionLabel: string;
  target: { kind: 'topic'; topicId: number } | { kind: 'exam' };
};

export type SyllabusMapVm = {
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
  exam: ExamNodeVm;
  /** Barra fija inferior; null cuando no hay nada pendiente (examen aprobado). */
  continueAction: ContinueActionVm | null;
};

const statusText: Record<TopicStatus, string> = {
  completed: 'Aprobado',
  active: 'En curso',
  locked: 'Bloqueado',
};

const examStatusText: Record<ExamStatus, string> = {
  locked: 'Bloqueado: aprueba todos los temas',
  available: 'Disponible',
  passed: 'Aprobado',
};

function toTopicNode(topic: SyllabusTopic): TopicNodeVm {
  const hint =
    topic.status === 'active'
      ? topic.retry
        ? '¡Vuelve a tomarla!'
        : '¡Toca para empezar!'
      : undefined;
  const progress = topic.retry ? ', por aprobar' : '';

  return {
    id: topic.id,
    label: `${topic.sortOrder}. ${topic.title}`,
    status: topic.status,
    hint,
    accessibilityLabel: `Tema ${topic.sortOrder}: ${topic.title}. ${statusText[topic.status]}${progress}`,
  };
}

function toContinueAction(syllabus: Syllabus, examTitle: string): ContinueActionVm | null {
  const { activeTopic, examStatus } = syllabus;
  if (activeTopic) {
    return {
      caption: activeTopic.retry ? 'Por aprobar' : 'Tema actual',
      title: activeTopic.title,
      actionLabel: 'Aprender',
      target: { kind: 'topic', topicId: activeTopic.id },
    };
  }
  if (examStatus === 'available') {
    return {
      caption: 'Todos los temas completados',
      title: examTitle,
      actionLabel: 'Presentar',
      target: { kind: 'exam' },
    };
  }
  return null;
}

export function toSyllabusMapVm(syllabus: Syllabus): SyllabusMapVm {
  const { level, completedTopics, totalTopics, examStatus } = syllabus;
  const progress = totalTopics > 0 ? completedTopics / totalTopics : 0;
  const levelName = `Nivel ${level.sortOrder}`;
  const examTitle = `Fin del ${levelName}`;

  return {
    header: {
      overline: levelName,
      levelName,
      title: level.title,
      description: level.description,
      progress,
      progressLabel: `${completedTopics} de ${totalTopics} temas aprobados`,
      percentLabel: `${Math.round(progress * 100)}%`,
    },
    nodes: syllabus.topics.map(toTopicNode),
    exam: {
      title: examTitle,
      caption: 'Aprueba los 4 temas',
      status: examStatus,
      accessibilityLabel: `${examTitle}. ${examStatusText[examStatus]}`,
    },
    continueAction: toContinueAction(syllabus, examTitle),
  };
}
