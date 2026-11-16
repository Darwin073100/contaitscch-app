import type { LessonSource } from '../entities/Lesson';
import type { LessonReader } from '../repositories/LessonReader';
import { courseRecords, InMemoryCourseProgressReader } from '../testing/courseRecords';
import { GetLessonUseCase } from './GetLessonUseCase';

const source = (topicId: number): LessonSource => ({
  level: { id: Math.floor(topicId / 100), order: Math.floor(topicId / 100) },
  topic: { id: topicId, title: `Tema ${topicId}`, order: topicId % 100 },
  objective: 'Objetivo',
  body: {
    explanation: ['Párrafo'],
    example: { title: 'Caso', steps: ['Paso'] },
    keyIdea: 'Idea',
    commonError: 'Error',
    activity: 'Actividad',
  },
  quiz: { questionCount: 2, passMark: 2 },
});

class InMemoryLessonReader implements LessonReader {
  async findLesson(topicId: number) {
    return topicId < 300 ? source(topicId) : null;
  }
}

const run = (topicId: number, records = courseRecords()) =>
  new GetLessonUseCase(
    new InMemoryLessonReader(),
    new InMemoryCourseProgressReader(records),
  ).execute({ topicId });

describe('GetLessonUseCase', () => {
  it('el primer tema está abierto y es nuevo', async () => {
    expect(await run(101)).toEqual({
      ok: true,
      value: { ...source(101), passed: false, retake: false },
    });
  });

  it('un tema con intentos sin aprobar se está retomando', async () => {
    const result = await run(102, courseRecords({ passed: [101], attempts: { 102: 1 } }));

    expect(result.ok && result.value).toMatchObject({ passed: false, retake: true });
  });

  it('un tema aprobado se puede repasar', async () => {
    const result = await run(101, courseRecords({ passed: [101] }));

    expect(result.ok && result.value).toMatchObject({ passed: true, retake: false });
  });

  it('un tema bloqueado no se abre', async () => {
    expect(await run(201)).toEqual({ ok: false, error: 'LESSON_LOCKED' });
  });

  it('LESSON_NOT_FOUND si no existe', async () => {
    expect(await run(999)).toEqual({ ok: false, error: 'LESSON_NOT_FOUND' });
  });
});
