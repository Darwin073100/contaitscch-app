import { and, count, eq, isNull, ne, or } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { quizProgress } from '@/core/database/schema';
import { databaseOf } from '@/core/database/SqliteUnitOfWork';
import type { SessionStore } from '@/core/session/SessionStore';
import type { Tx } from '@/core/transaction/UnitOfWork';

import type { QuizProgress } from '../../domain/entities/QuizProgress';
import type { QuizProgressRepository } from '../../domain/repositories/QuizProgressRepository';

const columns = {
  quizId: quizProgress.quizId,
  passed: quizProgress.passed,
  bestScore: quizProgress.bestScore,
  attempts: quizProgress.attempts,
  passedAt: quizProgress.passedAt,
  updatedAt: quizProgress.updatedAt,
};

/** La nube no tiene esta versión de la fila: synced_at vacío o distinto de updated_at. */
const isPending = or(
  isNull(quizProgress.syncedAt),
  ne(quizProgress.syncedAt, quizProgress.updatedAt),
);

export class SqliteQuizProgressRepository implements QuizProgressRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  private ofUser() {
    return eq(quizProgress.userId, this.session.requireUserId());
  }

  async find(quizId: number, tx?: Tx): Promise<QuizProgress | null> {
    const db = tx ? databaseOf(tx) : this.db;
    const row = db
      .select(columns)
      .from(quizProgress)
      .where(and(this.ofUser(), eq(quizProgress.quizId, quizId)))
      .get();
    return row ?? null;
  }

  async save(progress: QuizProgress, tx: Tx, { synced = false } = {}): Promise<void> {
    const values = {
      passed: progress.passed,
      bestScore: progress.bestScore,
      attempts: progress.attempts,
      passedAt: progress.passedAt,
      updatedAt: progress.updatedAt,
      // Pendiente = synced_at distinto de updated_at; sincronizada = iguales
      syncedAt: synced ? progress.updatedAt : null,
    };
    databaseOf(tx)
      .insert(quizProgress)
      .values({ userId: this.session.requireUserId(), quizId: progress.quizId, ...values })
      .onConflictDoUpdate({ target: [quizProgress.userId, quizProgress.quizId], set: values })
      .run();
  }

  async findPending(): Promise<QuizProgress[]> {
    return this.db
      .select(columns)
      .from(quizProgress)
      .where(and(this.ofUser(), isPending))
      .orderBy(quizProgress.quizId)
      .all();
  }

  async countPending(): Promise<number> {
    const row = this.db
      .select({ n: count() })
      .from(quizProgress)
      .where(and(this.ofUser(), isPending))
      .get();
    return row?.n ?? 0;
  }

  async deleteAll(tx: Tx): Promise<void> {
    databaseOf(tx).delete(quizProgress).where(this.ofUser()).run();
  }
}
