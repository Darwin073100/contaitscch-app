import type { AppDatabase } from '@/core/database/database';
import { quizProgress } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { SqliteTopicRepository } from './SqliteTopicRepository';

describe('SqliteTopicRepository', () => {
  let db: AppDatabase;
  let repo: SqliteTopicRepository;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteTopicRepository(db, testSession, testClock);
  });

  describe('findSession', () => {
    it('arma los 4 pasos fijos del tema con sus bloques', async () => {
      const session = await repo.findSession(101);

      expect(session?.level).toEqual({ id: 1, name: 'Nivel 1', sortOrder: 1 });
      expect(session?.topic).toEqual({ id: 101, title: '¿Qué es la contabilidad?', sortOrder: 1 });
      expect(session?.subtopics.map((s) => s.title)).toEqual([
        'Objetivo',
        'Explicación',
        'Ejemplo resuelto',
        'Repaso del tema',
      ]);
      expect(session?.subtopics[0].blocks[0]).toMatchObject({
        type: 'paragraph',
        text: expect.stringContaining('Definir la contabilidad'),
      });
      expect(session?.subtopics[2].blocks[0]).toMatchObject({
        type: 'example',
        title: 'La papelería de Ana',
        text: expect.stringMatching(/^1\. Lunes/),
      });
      expect(session?.subtopics[3].blocks.map((b) => b.type === 'callout' && b.title)).toEqual([
        'Idea clave',
        'Error común',
        'Actividad para practicar',
      ]);
      expect(session).toMatchObject({ completed: false, viewedSubtopics: 0 });
    });

    it('devuelve null si el tema no existe', async () => {
      expect(await repo.findSession(199)).toBeNull();
    });
  });

  describe('progreso', () => {
    it('isCompleted: false, luego true al marcarlo; null si no existe', async () => {
      expect(await repo.isCompleted(101)).toBe(false);

      await repo.markCompleted(101);

      expect(await repo.isCompleted(101)).toBe(true);
      expect(await repo.isCompleted(199)).toBeNull();
    });

    it('markCompleted es idempotente y aprueba el ejercicio del tema con la fecha del Clock', async () => {
      await repo.markCompleted(101);
      await repo.markCompleted(101);

      expect(db.select().from(quizProgress).all()).toEqual([
        expect.objectContaining({
          userId: TEST_USER_ID,
          quizId: 101,
          passed: true,
          passedAt: testClock.nowIso(),
          syncedAt: null,
        }),
      ]);
    });
  });
});
