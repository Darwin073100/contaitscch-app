import type { LevelProgress } from '../entities/Level';
import type { LevelRepository } from '../repositories/LevelRepository';
import { GetLevelsOverviewUseCase } from './GetLevelsOverviewUseCase';

class InMemoryLevelRepository implements LevelRepository {
  constructor(private readonly levels: LevelProgress[]) {}

  async getProgress() {
    return this.levels;
  }
}

const level = (sortOrder: number, completedTopics: number, examPassed = false): LevelProgress => ({
  id: sortOrder,
  name: `Nivel ${sortOrder}`,
  sortOrder,
  subtitle: '',
  description: '',
  completedTopics,
  totalTopics: 6,
  examPassed,
});

describe('GetLevelsOverviewUseCase', () => {
  it('el nivel actual es el más alto desbloqueado', async () => {
    const repo = new InMemoryLevelRepository([level(1, 6, true), level(2, 2), level(3, 0)]);

    const result = await new GetLevelsOverviewUseCase(repo).execute();

    expect(result.ok && result.value.currentLevel.sortOrder).toBe(2);
    expect(result.ok && result.value.career).toEqual({
      completedTopics: 8,
      totalTopics: 18,
      progress: 8 / 18,
    });
  });

  it('devuelve NO_LEVELS si aún no hay contenido', async () => {
    const result = await new GetLevelsOverviewUseCase(new InMemoryLevelRepository([])).execute();

    expect(result).toEqual({ ok: false, error: 'NO_LEVELS' });
  });
});
