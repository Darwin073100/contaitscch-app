import type { CourseLevel, CourseProgress } from '@/features/learning';

import type { LevelInfo } from '../entities/Level';
import type { LevelRepository } from '../repositories/LevelRepository';
import { GetLevelsOverviewUseCase } from './GetLevelsOverviewUseCase';

class InMemoryLevelRepository implements LevelRepository {
  constructor(private readonly levels: LevelInfo[]) {}

  async getLevels() {
    return this.levels;
  }
}

const info = (id: number): LevelInfo => ({
  id,
  sortOrder: id,
  title: `Título ${id}`,
  description: `Meta ${id}`,
});

const courseLevel = (levelId: number, passedCount: number, state: CourseLevel['state']) => ({
  levelId,
  levelOrder: levelId,
  passedCount,
  totalCount: 4,
  state,
});

/** Avance del curso ya calculado por learning (aquí solo importa su forma). */
const course = (levels: CourseLevel[], currentLevelId: number | null): CourseProgress => {
  const passedCount = levels.reduce((n, l) => n + l.passedCount, 0);
  const totalCount = levels.reduce((n, l) => n + l.totalCount, 0);
  return {
    lessons: [],
    levels,
    nextLesson: null,
    currentLevelId,
    passedCount,
    totalCount,
    finalExamUnlocked: passedCount === totalCount,
  };
};

const run = (infos: LevelInfo[], progress: CourseProgress) =>
  new GetLevelsOverviewUseCase(new InMemoryLevelRepository(infos), {
    execute: async () => progress,
  }).execute();

describe('GetLevelsOverviewUseCase', () => {
  it('traduce el estado de cada nivel y su avance', async () => {
    const result = await run(
      [info(3), info(1), info(2)],
      course(
        [courseLevel(1, 4, 'done'), courseLevel(2, 1, 'current'), courseLevel(3, 0, 'locked')],
        2,
      ),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.levels.map((l) => [l.id, l.status, l.progress])).toEqual([
      [1, 'completed', 1],
      [2, 'inProgress', 0.25],
      [3, 'locked', 0],
    ]);
    expect(result.value.currentLevel.id).toBe(2);
    expect(result.value.career).toEqual({ completedTopics: 5, totalTopics: 12, progress: 5 / 12 });
  });

  it('un nivel sin temas queda bloqueado', async () => {
    const result = await run([info(1), info(2)], course([courseLevel(1, 0, 'current')], 1));

    expect(result.ok && result.value.levels[1]).toMatchObject({ status: 'locked', totalTopics: 0 });
  });

  it('sin nivel actual (curso vacío) usa el primero', async () => {
    const result = await run([info(1)], course([], null));

    expect(result.ok && result.value.currentLevel.id).toBe(1);
  });

  it('NO_LEVELS si no hay niveles', async () => {
    expect(await run([], course([], null))).toEqual({ ok: false, error: 'NO_LEVELS' });
  });
});
