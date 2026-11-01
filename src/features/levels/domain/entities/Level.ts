// Niveles de contabilidad (Básico, Intermedio, Avanzado) con el avance del usuario.

export type LevelStatus = 'completed' | 'inProgress' | 'locked';

/** Nivel con el progreso guardado del usuario, tal como lo entrega el repositorio. */
export type LevelProgress = {
  id: number;
  name: string;
  sortOrder: number;
  /** "Fundamentos y Cuentas". */
  subtitle: string;
  description: string;
  completedTopics: number;
  totalTopics: number;
  examPassed: boolean;
};

export type LevelOverviewItem = LevelProgress & {
  status: LevelStatus;
  /** 0 a 1; 1 si aprobó el examen. */
  progress: number;
};

export type LevelsOverview = {
  /** Ordenados por sortOrder. */
  levels: LevelOverviewItem[];
  /** Nivel más alto desbloqueado (el del usuario en el ranking). */
  currentLevel: LevelOverviewItem;
  career: { completedTopics: number; totalTopics: number; progress: number };
};
