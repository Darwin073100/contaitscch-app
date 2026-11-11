import type { Tx, UnitOfWork } from '@/core/transaction/UnitOfWork';
import type { CourseLesson, CourseLevel, CourseProgress } from '@/features/learning';

import { FINAL_EXAM_ID, type GradableQuiz } from '../entities/Quiz';
import type { QuizProgress } from '../entities/QuizProgress';
import type { CourseProgressSource } from '../repositories/CourseProgressSource';
import type { QuizProgressRepository } from '../repositories/QuizProgressRepository';
import type { QuizReader } from '../repositories/QuizReader';

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

  async find(quizId: number) {
    return this.rows.get(quizId) ?? null;
  }

  async save(progress: QuizProgress, _tx: Tx) {
    this.rows.set(progress.quizId, progress);
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
