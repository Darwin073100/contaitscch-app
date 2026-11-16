import type { AppDatabase } from '@/core/database/database';
import { quizProgress } from '@/core/database/schema';
import { SqliteUnitOfWork } from '@/core/database/SqliteUnitOfWork';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import type { QuizProgress } from '../../domain/entities/QuizProgress';
import { SqliteQuizProgressRepository } from './SqliteQuizProgressRepository';

const T1 = '2026-11-01T10:00:00.000Z';
const T2 = '2026-11-02T10:00:00.000Z';

const progress = (overrides: Partial<QuizProgress> = {}): QuizProgress => ({
  quizId: 101,
  passed: false,
  bestScore: 1,
  attempts: 1,
  passedAt: null,
  updatedAt: T1,
  ...overrides,
});

describe('SqliteQuizProgressRepository', () => {
  let db: AppDatabase;
  let repo: SqliteQuizProgressRepository;
  let uow: SqliteUnitOfWork;

  beforeEach(async () => {
    db = await createSeededTestDatabase();
    repo = new SqliteQuizProgressRepository(db, testSession);
    uow = new SqliteUnitOfWork(db);
  });

  it('find devuelve null si nunca lo ha presentado', async () => {
    expect(await repo.find(101)).toBeNull();
  });

  it('save inserta y luego actualiza el avance del usuario', async () => {
    await uow.run((tx) => repo.save(progress(), tx));
    await uow.run((tx) =>
      repo.save(
        progress({ passed: true, bestScore: 2, attempts: 2, passedAt: T2, updatedAt: T2 }),
        tx,
      ),
    );

    expect(await repo.find(101)).toEqual({
      quizId: 101,
      passed: true,
      bestScore: 2,
      attempts: 2,
      passedAt: T2,
      updatedAt: T2,
    });
  });

  it('guardado como sincronizado no queda pendiente; al cambiar vuelve a estarlo', async () => {
    await uow.run((tx) => repo.save(progress(), tx, { synced: true }));

    const [synced] = db.select().from(quizProgress).all();
    expect(synced).toMatchObject({ userId: TEST_USER_ID, syncedAt: T1, updatedAt: T1 });
    expect(await repo.countPending()).toBe(0);

    await uow.run((tx) => repo.save(progress({ attempts: 2, updatedAt: T2 }), tx));

    expect(await repo.countPending()).toBe(1);
    expect(await repo.findPending()).toEqual([progress({ attempts: 2, updatedAt: T2 })]);
  });

  it('una fila marcada a mano con otra fecha también cuenta como pendiente', async () => {
    await uow.run((tx) => repo.save(progress({ updatedAt: T2 }), tx));
    db.update(quizProgress).set({ syncedAt: T1 }).run();

    expect(await repo.countPending()).toBe(1);
  });

  it('deleteAll borra solo el avance del usuario de la sesión', async () => {
    await uow.run(async (tx) => {
      await repo.save(progress(), tx);
      await repo.save(progress({ quizId: 102 }), tx);
    });

    await uow.run((tx) => repo.deleteAll(tx));

    expect(await repo.find(101)).toBeNull();
    expect(await repo.countPending()).toBe(0);
  });

  it('un aprobado sin fecha de aprobación lo rechaza la base de datos', async () => {
    await expect(uow.run((tx) => repo.save(progress({ passed: true }), tx))).rejects.toThrow(
      /CHECK/,
    );
  });
});
