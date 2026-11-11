// Temario de un nivel con el avance del usuario (pestaña Aprender).

export type TopicStatus = 'completed' | 'active' | 'locked';
/** Meta al final de la ruta del nivel: `passed` cuando sus temas están aprobados. */
export type ExamStatus = 'locked' | 'available' | 'passed';

export type SyllabusLevel = {
  id: number;
  sortOrder: number;
  /** "Fundamentos: qué es la contabilidad y para qué sirve". */
  title: string;
  /** "Al terminar este nivel el alumno…". */
  description: string;
};

export type SyllabusTopic = {
  id: number;
  title: string;
  sortOrder: number;
  status: TopicStatus;
  /** Activo con intentos sin aprobar: se vuelve a tomar la lección. */
  retry: boolean;
};

export type Syllabus = {
  level: SyllabusLevel;
  /** Ordenados por sortOrder. */
  topics: SyllabusTopic[];
  completedTopics: number;
  totalTopics: number;
  /** Tema desbloqueado sin aprobar de este nivel; null si no hay. */
  activeTopic: SyllabusTopic | null;
  examStatus: ExamStatus;
};
