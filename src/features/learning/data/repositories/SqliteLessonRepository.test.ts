import { createSeededTestDatabase } from '@/core/database/testing/createSeededTestDatabase';

import { SqliteLessonRepository } from './SqliteLessonRepository';

describe('SqliteLessonRepository', () => {
  it('devuelve el contenido del tema y los datos de su ejercicio', async () => {
    const repo = new SqliteLessonRepository(await createSeededTestDatabase());

    const lesson = await repo.findLesson(101);

    expect(lesson).toMatchObject({
      level: { id: 1, order: 1 },
      topic: { id: 101, title: '¿Qué es la contabilidad?', order: 1 },
      objective: expect.stringContaining('Definir la contabilidad'),
      quiz: { questionCount: 4, passMark: 4 },
    });
    expect(lesson?.body.explanation).toHaveLength(3);
    expect(lesson?.body.example.title).toBe('La papelería de Ana');
  });

  it('devuelve null si el tema no existe', async () => {
    const repo = new SqliteLessonRepository(await createSeededTestDatabase());

    expect(await repo.findLesson(999)).toBeNull();
  });
});
