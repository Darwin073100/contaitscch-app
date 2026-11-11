// Avance del curso completo: 6 niveles × 4 temas recorridos en orden global (N1-L1 … N6-L4).

/** Un tema con el avance guardado del usuario, tal como lo entrega el repositorio. */
export type LessonRecord = {
  topicId: number;
  levelId: number;
  /** Orden del nivel en el curso. */
  levelOrder: number;
  /** Orden del tema dentro de su nivel (1..4). */
  order: number;
  title: string;
  passed: boolean;
  attempts: number;
  bestScore: number;
};

/**
 * `done`: aprobado · `current`: desbloqueado sin intentos · `retry`: desbloqueado con intentos sin
 * aprobar (se vuelve a tomar la lección) · `locked`: el anterior no está aprobado.
 */
export type LessonState = 'done' | 'current' | 'retry' | 'locked';

export type CourseLesson = LessonRecord & {
  /** Posición en el orden global, desde 0. */
  index: number;
  state: LessonState;
};

/** `done`: sus temas aprobados · `current`: abierto · `locked`: su primer tema está bloqueado. */
export type LevelState = 'done' | 'current' | 'locked';

export type CourseLevel = {
  levelId: number;
  levelOrder: number;
  passedCount: number;
  totalCount: number;
  state: LevelState;
};

export type CourseProgress = {
  /** En orden global. */
  lessons: CourseLesson[];
  /** En orden del curso. */
  levels: CourseLevel[];
  /** Primer tema sin aprobar; null si ya aprobó todos. */
  nextLesson: CourseLesson | null;
  /** Nivel del siguiente tema (o el último si ya aprobó todos); null si no hay contenido. */
  currentLevelId: number | null;
  passedCount: number;
  totalCount: number;
  /** El examen integrador se presenta con todos los temas aprobados. */
  finalExamUnlocked: boolean;
};
