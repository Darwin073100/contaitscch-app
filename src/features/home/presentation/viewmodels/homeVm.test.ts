import type { LevelOverviewItem, LevelsOverview } from '@/features/levels';

import { toHomeVm } from './homeVm';

const level = (
  sortOrder: number,
  status: LevelOverviewItem['status'],
  completedTopics: number,
): LevelOverviewItem => ({
  id: sortOrder,
  name: ['Básico', 'Intermedio', 'Avanzado'][sortOrder - 1],
  sortOrder,
  subtitle: '',
  description: '',
  completedTopics,
  totalTopics: 6,
  examPassed: false,
  status,
  progress: completedTopics / 6,
});

const levels = [level(1, 'inProgress', 3), level(2, 'locked', 0), level(3, 'locked', 0)];
const overview: LevelsOverview = {
  levels,
  currentLevel: levels[0],
  career: { completedTopics: 3, totalTopics: 18, progress: 3 / 18 },
};

describe('toHomeVm', () => {
  it('arma estadísticas, progreso de la carrera y tarjetas de nivel', () => {
    const vm = toHomeVm(overview);

    expect(vm.stats).toEqual({ topicsLabel: '3/18', levelName: 'Básico' });
    expect(vm.career).toMatchObject({
      percentLabel: '17%',
      completedLabel: 'Temas completados: 3/18',
      remainingLabel: '15 por completar',
    });
    expect(vm.levelsCountLabel).toBe('3 Bloques');
    expect(vm.levels.map((l) => l.unlockHint?.emphasis)).toEqual([undefined, 'next', 'later']);
  });

  it('con todos los temas completados no muestra "0 por completar"', () => {
    const done: LevelsOverview = {
      ...overview,
      career: { completedTopics: 18, totalTopics: 18, progress: 1 },
    };
    expect(toHomeVm(done).career.remainingLabel).toBe('¡Todo completado!');
  });
});
