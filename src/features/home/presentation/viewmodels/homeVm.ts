import type { UserStats } from '@/features/gamification';
import { toLevelCardVm, type LevelCardVm, type LevelsOverview } from '@/features/levels';

// Textos ya armados para la pantalla Niveles (Home): la vista solo pinta.

export type HomeVm = {
  stats: { streak: number; xp: number; levelName: string };
  greeting: { overline: string; title: string; subtitle: string };
  career: {
    title: string;
    subtitle: string;
    progress: number;
    percentLabel: string;
    completedLabel: string;
    xpTodayLabel: string;
  };
  levelsCountLabel: string;
  levels: LevelCardVm[];
};

export function toHomeVm(overview: LevelsOverview, stats: UserStats): HomeVm {
  const { career, levels, currentLevel } = overview;
  return {
    stats: { streak: stats.streak, xp: stats.xpTotal, levelName: currentLevel.name },
    greeting: {
      overline: 'Portal Académico ITSSCH',
      // Temporal: el nombre del usuario llegará con la sesión (feature auth).
      title: '¡Hola, Contador! 👋',
      subtitle: 'Listo para tu lección de hoy',
    },
    career: {
      title: 'Progreso de la Carrera',
      subtitle: 'Plan Semestral de Contaduría',
      progress: career.progress,
      percentLabel: `${Math.round(career.progress * 100)}%`,
      completedLabel: `Temas completados: ${career.completedTopics}/${career.totalTopics}`,
      xpTodayLabel: stats.xpToday > 0 ? `+${stats.xpToday} XP hoy` : 'Aún sin XP hoy',
    },
    levelsCountLabel: `${levels.length} Bloques`,
    levels: levels.map((level, i) => toLevelCardVm(level, levels[i - 1])),
  };
}
