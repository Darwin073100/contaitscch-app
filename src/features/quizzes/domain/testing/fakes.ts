import type { Connectivity } from '@/core/connectivity/Connectivity';
import { err, ok, type Result } from '@/core/result/Result';
import type { Tx, UnitOfWork } from '@/core/transaction/UnitOfWork';
import type { CourseLesson, CourseLevel, CourseProgress } from '@/features/learning';

import { FINAL_EXAM_ID, type GradableQuiz } from '../entities/Quiz';
import type { QuizProgress } from '../entities/QuizProgress';
import type { SyncState } from '../entities/Sync';
import { mergeProgress } from '../policies/ProgressRules';
import type { CourseProgressSource } from '../repositories/CourseProgressSource';
import type {
  ProgressRemote,
  RemoteSyncError,
  RemoteSyncResponse,
} from '../repositories/ProgressRemote';
import type { QuizProgressRepository } from '../repositories/QuizProgressRepository';
import type { QuizReader } from '../repositories/QuizReader';
import type { SyncStateRepository } from '../repositories/SyncStateRepository';

/** Ejercicio de `questions` preguntas con 4 opciones; la correcta es la B (pregunta×10 + 2). */
export function gradableQuiz(
  id: number,
  { questions = 2, passMark = questions }: { questions?: number; passMark?: number } = {},
): GradableQuiz {
  const ids = Array.from({ length: questions }, (_, i) => id * 100 + i + 1);
  return {
    id,
    kind: id === FINAL_EXAM_ID ? 'final' : 'topic',
    topicId: id === FINAL_EXAM_ID ? null : id,
    passMark,
    questions: ids.map((q) => ({
      id: q,
      statement: `Pregunta ${q}`,
      options: [1, 2, 3, 4].map((o) => ({ id: q * 10 + o, text: `Opción ${o}` })),
    })),
    answerKey: Object.fromEntries(
      ids.map((q) => [
        q,
        { correctOptionId: q * 10 + 2, feedback: id === FINAL_EXAM_ID ? null : `Bien: ${q}` },
      ]),
    ),
  };
}

/** Respuestas con `correct` aciertos (los primeros) y el resto con la opción A. */
export function answersFor(quiz: GradableQuiz, correct: number): Record<number, number> {
  return Object.fromEntries(
    quiz.questions.map((q, i) => [q.id, i < correct ? q.id * 10 + 2 : q.id * 10 + 1]),
  );
}

export class InMemoryQuizReader implements QuizReader {
  constructor(private readonly quizzes: GradableQuiz[]) {}

  async findQuiz(quizId: number) {
    return this.quizzes.find((q) => q.id === quizId) ?? null;
  }
}

export class InMemoryQuizProgressRepository implements QuizProgressRepository {
  readonly rows = new Map<number, QuizProgress>();
  /** quizIds que la nube ya tiene en su versión actual. */
  readonly synced = new Set<number>();

  async find(quizId: number) {
    return this.rows.get(quizId) ?? null;
  }

  async save(progress: QuizProgress, _tx: Tx, options: { synced?: boolean } = {}) {
    this.rows.set(progress.quizId, progress);
    if (options.synced) this.synced.add(progress.quizId);
    else this.synced.delete(progress.quizId);
  }

  async findPending() {
    return [...this.rows.values()].filter((r) => !this.synced.has(r.quizId));
  }

  async countPending() {
    return (await this.findPending()).length;
  }

  async deleteAll() {
    this.rows.clear();
    this.synced.clear();
  }
}

export class InMemorySyncStateRepository implements SyncStateRepository {
  state: SyncState = { generation: null, lastSyncedAt: null, lastError: null };

  async get() {
    return this.state;
  }

  async save(state: SyncState) {
    this.state = state;
  }
}

/**
 * Nube de prueba con la misma regla de fusión que sync_progress. `fail` simula un error de red o
 * de token; `onSync` deja simular cambios locales mientras la subida va en camino.
 */
export class FakeProgressRemote implements ProgressRemote {
  readonly rows = new Map<number, QuizProgress>();
  generation = 0;
  fail: RemoteSyncError | null = null;
  calls = 0;
  onSync?: () => Promise<void>;

  constructor(private readonly now: string) {}

  async sync(
    generation: number | null,
    pending: QuizProgress[],
  ): Promise<Result<RemoteSyncResponse, RemoteSyncError>> {
    this.calls++;
    await this.onSync?.();
    if (this.fail) return err(this.fail);
    const all = () => [...this.rows.values()].sort((a, b) => a.quizId - b.quizId);
    if (generation !== this.generation) {
      return ok({ status: 'replace', generation: this.generation, progress: all() });
    }
    for (const row of pending) {
      // El servidor recorta las fechas a su now()
      const capped = { ...row, updatedAt: row.updatedAt > this.now ? this.now : row.updatedAt };
      const current = this.rows.get(row.quizId);
      this.rows.set(row.quizId, current ? mergeProgress(current, capped) : capped);
    }
    return ok({ status: 'ok', generation: this.generation, syncedAt: this.now, progress: all() });
  }

  async reset(): Promise<Result<{ generation: number }, 'NETWORK' | 'INVALID_TOKEN'>> {
    if (this.fail === 'NETWORK' || this.fail === 'INVALID_TOKEN') return err(this.fail);
    this.rows.clear();
    this.generation++;
    return ok({ generation: this.generation });
  }
}

export class FakeConnectivity implements Connectivity {
  constructor(public online = true) {}

  async isOnline() {
    return this.online;
  }

  onReconnect() {
    return () => undefined;
  }
}

export const immediateUnitOfWork: UnitOfWork = {
  run: (work) => work({} as Tx),
};

/**
 * Curso de prueba calculado del avance en memoria: temas en orden global, cada uno abierto si el
 * anterior está aprobado (misma regla que learning).
 */
export function courseFrom(
  progress: InMemoryQuizProgressRepository,
  topicIds: number[],
): CourseProgressSource {
  return {
    execute: async (): Promise<CourseProgress> => {
      const lessons: CourseLesson[] = topicIds.map((topicId, index) => {
        const row = progress.rows.get(topicId);
        const passed = row?.passed ?? false;
        const unlocked = index === 0 || (progress.rows.get(topicIds[index - 1])?.passed ?? false);
        return {
          topicId,
          levelId: Math.floor(topicId / 100),
          levelOrder: Math.floor(topicId / 100),
          order: topicId % 100,
          title: `Tema ${topicId}`,
          passed,
          attempts: row?.attempts ?? 0,
          bestScore: row?.bestScore ?? 0,
          index,
          state: passed ? 'done' : !unlocked ? 'locked' : row ? 'retry' : 'current',
        };
      });
      const levelIds = [...new Set(lessons.map((l) => l.levelId))];
      const levels: CourseLevel[] = levelIds.map((levelId) => {
        const own = lessons.filter((l) => l.levelId === levelId);
        const passedCount = own.filter((l) => l.passed).length;
        return {
          levelId,
          levelOrder: levelId,
          passedCount,
          totalCount: own.length,
          state:
            passedCount === own.length ? 'done' : own[0].state === 'locked' ? 'locked' : 'current',
        };
      });
      const passedCount = lessons.filter((l) => l.passed).length;
      return {
        lessons,
        levels,
        nextLesson: lessons.find((l) => !l.passed) ?? null,
        currentLevelId: lessons.find((l) => !l.passed)?.levelId ?? levelIds.at(-1) ?? null,
        passedCount,
        totalCount: lessons.length,
        finalExamUnlocked: passedCount === lessons.length,
      };
    },
  };
}
