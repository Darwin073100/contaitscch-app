import type { LevelOverviewItem, LevelProgress } from '../entities/Level';

/** Temas que cuentan como hechos: todos si ya aprobó el examen del nivel. */
function doneTopics(level: LevelProgress): number {
  return level.examPassed ? level.totalTopics : level.completedTopics;
}

/** Progreso del nivel: temas completados / total (100% si aprobó el examen). */
export function levelProgress(level: LevelProgress): number {
  if (level.examPassed) return 1;
  return level.totalTopics > 0 ? level.completedTopics / level.totalTopics : 0;
}

/** El nivel 1 siempre está abierto; el nivel N se abre al aprobar el examen del nivel N-1. */
export function resolveLevelStatuses(levels: readonly LevelProgress[]): LevelOverviewItem[] {
  const sorted = [...levels].sort((a, b) => a.sortOrder - b.sortOrder);
  const passedOrders = new Set(sorted.filter((l) => l.examPassed).map((l) => l.sortOrder));

  return sorted.map((level): LevelOverviewItem => {
    const unlocked = level.sortOrder === 1 || passedOrders.has(level.sortOrder - 1);
    const status = level.examPassed ? 'completed' : unlocked ? 'inProgress' : 'locked';
    return { ...level, status, progress: levelProgress(level) };
  });
}

/** Avance de toda la carrera: temas hechos de todos los niveles / temas totales. */
export function careerProgress(levels: readonly LevelProgress[]) {
  const completedTopics = levels.reduce((sum, l) => sum + doneTopics(l), 0);
  const totalTopics = levels.reduce((sum, l) => sum + l.totalTopics, 0);
  return {
    completedTopics,
    totalTopics,
    progress: totalTopics > 0 ? completedTopics / totalTopics : 0,
  };
}
