// Los 6 niveles del curso con el avance del usuario (pestaña Niveles).

export type LevelStatus = 'completed' | 'inProgress' | 'locked';

/** Textos de un nivel, tal como los entrega el repositorio. */
export type LevelInfo = {
  id: number;
  sortOrder: number;
  /** "Fundamentos: qué es la contabilidad y para qué sirve". */
  title: string;
  /** "Al terminar este nivel el alumno…". */
  description: string;
};

export type LevelOverviewItem = LevelInfo & {
  completedTopics: number;
  totalTopics: number;
  status: LevelStatus;
  /** Temas aprobados / temas del nivel, de 0 a 1. */
  progress: number;
};

export type LevelsOverview = {
  /** Ordenados por sortOrder. */
  levels: LevelOverviewItem[];
  /** Nivel del siguiente tema por aprobar (el último si ya aprobó todos). */
  currentLevel: LevelOverviewItem;
  career: { completedTopics: number; totalTopics: number; progress: number };
};
