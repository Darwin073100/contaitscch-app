import type { SyllabusSource, TopicProgress } from '../entities/Syllabus';
import type { SyllabusRepository } from '../repositories/SyllabusRepository';
import { GetSyllabusUseCase } from './GetSyllabusUseCase';

class InMemorySyllabusRepository implements SyllabusRepository {
  constructor(private readonly sources: SyllabusSource[]) {}

  async findByLevel(levelId: number) {
    return this.sources.find((s) => s.level.id === levelId) ?? null;
  }
}

const topic = (sortOrder: number, completed: boolean, viewedSubtopics = 0): TopicProgress => ({
  id: 100 + sortOrder,
  title: `Tema ${sortOrder}`,
  sortOrder,
  completed,
  viewedSubtopics,
  totalSubtopics: 3,
});

const level = {
  id: 1,
  name: 'Básico',
  sortOrder: 1,
  title: 'Introducción a la Contabilidad',
  description: 'Domina los cimientos financieros paso a paso.',
};

describe('GetSyllabusUseCase', () => {
  it('calcula progreso, tema activo y estado del examen', async () => {
    const repo = new InMemorySyllabusRepository([
      {
        level,
        topics: [topic(1, true), topic(2, true), topic(3, false, 2), topic(4, false)],
        examPassed: false,
      },
    ]);

    const result = await new GetSyllabusUseCase(repo).execute({ levelId: 1 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.completedTopics).toBe(2);
    expect(result.value.totalTopics).toBe(4);
    expect(result.value.activeTopic?.id).toBe(103);
    expect(result.value.examStatus).toBe('locked');
  });

  it('sin tema activo cuando todos están completados', async () => {
    const repo = new InMemorySyllabusRepository([
      { level, topics: [topic(1, true), topic(2, true)], examPassed: false },
    ]);

    const result = await new GetSyllabusUseCase(repo).execute({ levelId: 1 });

    expect(result.ok && result.value.activeTopic).toBeNull();
    expect(result.ok && result.value.examStatus).toBe('available');
  });

  it('devuelve LEVEL_NOT_FOUND si el nivel no existe', async () => {
    const result = await new GetSyllabusUseCase(new InMemorySyllabusRepository([])).execute({
      levelId: 9,
    });

    expect(result).toEqual({ ok: false, error: 'LEVEL_NOT_FOUND' });
  });
});
