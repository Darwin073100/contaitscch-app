import type { LevelProgress } from '../entities/Level';
import { careerProgress, levelProgress, resolveLevelStatuses } from './LevelUnlockPolicy';

const level = (
  sortOrder: number,
  completedTopics: number,
  examPassed = false,
  totalTopics = 6,
): LevelProgress => ({
  id: sortOrder,
  name: `Nivel ${sortOrder}`,
  sortOrder,
  subtitle: '',
  description: '',
  completedTopics,
  totalTopics,
  examPassed,
});

const statuses = (levels: LevelProgress[]) => resolveLevelStatuses(levels).map((l) => l.status);

describe('resolveLevelStatuses', () => {
  it('usuario nuevo: solo el nivel 1 está abierto', () => {
    expect(statuses([level(1, 0), level(2, 0), level(3, 0)])).toEqual([
      'inProgress',
      'locked',
      'locked',
    ]);
  });

  it('completar todos los temas no desbloquea: hace falta aprobar el examen', () => {
    expect(statuses([level(1, 6), level(2, 0)])).toEqual(['inProgress', 'locked']);
  });

  it('aprobar el examen completa el nivel y abre el siguiente', () => {
    expect(statuses([level(1, 6, true), level(2, 1), level(3, 0)])).toEqual([
      'completed',
      'inProgress',
      'locked',
    ]);
  });

  it('ordena por sortOrder', () => {
    expect(resolveLevelStatuses([level(2, 0), level(1, 0)]).map((l) => l.sortOrder)).toEqual([
      1, 2,
    ]);
  });
});

describe('levelProgress', () => {
  it('temas completados / total', () => {
    expect(levelProgress(level(1, 3))).toBe(0.5);
  });

  it('100% con el examen aprobado', () => {
    expect(levelProgress(level(1, 4, true))).toBe(1);
  });

  it('0 si el nivel no tiene temas', () => {
    expect(levelProgress(level(1, 0, false, 0))).toBe(0);
  });
});

describe('careerProgress', () => {
  it('suma los temas de todos los niveles; un examen aprobado cuenta el nivel completo', () => {
    expect(careerProgress([level(1, 4, true), level(2, 3), level(3, 0)])).toEqual({
      completedTopics: 9,
      totalTopics: 18,
      progress: 0.5,
    });
  });
});
