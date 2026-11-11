import { and, eq } from 'drizzle-orm';

import type { AppDatabase } from '@/core/database/database';
import { quizProgress } from '@/core/database/schema';
import { databaseOf } from '@/core/database/SqliteUnitOfWork';
import type { SessionStore } from '@/core/session/SessionStore';
import type { Tx } from '@/core/transaction/UnitOfWork';

import type { QuizProgress } from '../../domain/entities/QuizProgress';
import type { QuizProgressRepository } from '../../domain/repositories/QuizProgressRepository';

export class SqliteQuizProgressRepository implements QuizProgressRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
  ) {}

  async find(quizId: number, tx?: Tx): Promise<QuizProgress | null> {
    const db = tx ? databaseOf(tx) : this.db;
    const row = db
      .select({
        quizId: quizProgress.quizId,
        passed: quizProgress.passed,
        bestScore: quizProgress.bestScore,
        attempts: quizProgress.attempts,
        passedAt: quizProgress.passedAt,
        updatedAt: quizProgress.updatedAt,
      })
      .from(quizProgress)
      .where(
        and(eq(quizProgress.userId, this.session.requireUserId()), eq(quizProgress.quizId, quizId)),
      )
      .get();
    return row ?? null;
  }

  async save(progress: QuizProgress, tx: Tx): Promise<void> {
    // synced_at no se toca: al cambiar updated_at la fila queda pendiente de subir
    const values = {
      passed: progress.passed,
      bestScore: progress.bestScore,
      attempts: progress.attempts,
      passedAt: progress.passedAt,
      updatedAt: progress.updatedAt,
    };
    databaseOf(tx)
      .insert(quizProgress)
      .values({ userId: this.session.requireUserId(), quizId: progress.quizId, ...values })
      .onConflictDoUpdate({ target: [quizProgress.userId, quizProgress.quizId], set: values })
      .run();
  }
}
