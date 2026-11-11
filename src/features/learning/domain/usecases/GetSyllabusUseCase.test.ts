import type { SyllabusLevel } from '../entities/Syllabus';
import type { SyllabusRepository } from '../repositories/SyllabusRepository';
import { courseRecords, InMemoryCourseProgressReader } from '../testing/courseRecords';
import { GetSyllabusUseCase } from './GetSyllabusUseCase';

class InMemorySyllabusRepository implements SyllabusRepository {
  async findLevel(levelId: number): Promise<SyllabusLevel | null> {
    return levelId <= 2
      ? { id: levelId, sortOrder: levelId, title: `Nivel ${levelId}`, description: 'Meta' }
      : null;
  }
}

const run = (levelId: number, records = courseRecords()) =>
  new GetSyllabusUseCase(
    new InMemorySyllabusRepository(),
    new InMemoryCourseProgressReader(records),
  ).execute({ levelId });

describe('GetSyllabusUseCase', () => {
  it('calcula avance, tema activo y la meta del nivel', async () => {
    const result = await run(1, courseRecords({ passed: [101, 102] }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.topics.map((t) => t.status)).toEqual([
      'completed',
      'completed',
      'active',
      'locked',
    ]);
    expect(result.value.completedTopics).toBe(2);
    expect(result.value.totalTopics).toBe(4);
    expect(result.value.activeTopic?.id).toBe(103);
    expect(result.value.examStatus).toBe('locked');
  });

  it('el primer tema de un nivel depende del último tema del nivel anterior', async () => {
    const locked = await run(2, courseRecords({ passed: [101, 102, 103] }));
    const open = await run(2, courseRecords({ passed: [101, 102, 103, 104] }));

    expect(locked.ok && locked.value.activeTopic).toBeNull();
    expect(open.ok && open.value.activeTopic?.id).toBe(201);
  });

  it('marca el tema con intentos sin aprobar para volver a tomarlo', async () => {
    const result = await run(1, courseRecords({ passed: [101], attempts: { 102: 2 } }));

    expect(result.ok && result.value.activeTopic).toMatchObject({ id: 102, retry: true });
  });

  it('con sus 4 temas aprobados la meta del nivel queda aprobada', async () => {
    const result = await run(1, courseRecords({ passed: [101, 102, 103, 104] }));

    expect(result.ok && result.value.activeTopic).toBeNull();
    expect(result.ok && result.value.examStatus).toBe('passed');
  });

  it('LEVEL_NOT_FOUND si el nivel no existe', async () => {
    expect(await run(9)).toEqual({ ok: false, error: 'LEVEL_NOT_FOUND' });
  });
});
