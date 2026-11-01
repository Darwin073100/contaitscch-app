// Temario de un nivel con el progreso del usuario (pestaña Aprender).

export type TopicStatus = 'completed' | 'active' | 'locked';
export type ExamStatus = 'locked' | 'available' | 'passed';

export type SyllabusLevel = {
  id: number;
  name: string;
  sortOrder: number;
  /** Nombre del módulo: "Introducción a la Contabilidad". */
  title: string;
  description: string;
};

/** Tema con el progreso guardado del usuario, tal como lo entrega el repositorio. */
export type TopicProgress = {
  id: number;
  title: string;
  sortOrder: number;
  completed: boolean;
  /** Subtemas vistos (el "2/3" del globo); 0 si no se ha abierto. */
  viewedSubtopics: number;
  totalSubtopics: number;
};

export type SyllabusSource = {
  level: SyllabusLevel;
  topics: TopicProgress[];
  examPassed: boolean;
};

export type SyllabusTopic = TopicProgress & { status: TopicStatus };

export type Syllabus = {
  level: SyllabusLevel;
  /** Ordenados por sortOrder. */
  topics: SyllabusTopic[];
  completedTopics: number;
  totalTopics: number;
  /** Primer tema desbloqueado sin completar; null si ya terminó todos. */
  activeTopic: SyllabusTopic | null;
  examStatus: ExamStatus;
};
