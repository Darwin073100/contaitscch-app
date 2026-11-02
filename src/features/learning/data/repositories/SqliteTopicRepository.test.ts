import type { AppDatabase } from '@/core/database/database';
import { subtopicProgress, topicProgress } from '@/core/database/schema';
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
    it('devuelve el tema con sus subtemas en orden y los bloques ya convertidos', async () => {
      const session = await repo.findSession(104);

      expect(session?.level).toEqual({ id: 1, name: 'Básico', sortOrder: 1 });
      expect(session?.topic).toEqual({
        id: 104,
        title: 'Cuentas T (Esquemas de Mayor)',
        sortOrder: 4,
      });
      expect(session?.subtopics.map((s) => s.id)).toEqual([10401, 10402, 10403, 10404]);
      expect(session?.subtopics[1].blocks[1]).toMatchObject({
        type: 't_account',
        debit: { label: 'Lado Izquierdo • Cargos' },
      });
      expect(session).toMatchObject({ completed: false, viewedSubtopics: 0 });
    });

    it('cuenta los subtemas vistos para retomar', async () => {
      db.insert(subtopicProgress)
        .values({ userId: TEST_USER_ID, subtopicId: 10401, viewedAt: testClock.nowIso() })
        .run();

      expect((await repo.findSession(104))?.viewedSubtopics).toBe(1);
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

    it('markCompleted es idempotente y guarda la fecha del Clock', async () => {
      await repo.markCompleted(101);
      await repo.markCompleted(101);

      expect(db.select().from(topicProgress).all()).toEqual([
        expect.objectContaining({
          userId: TEST_USER_ID,
          topicId: 101,
          completedAt: testClock.nowIso(),
        }),
      ]);
    });
  });
});
