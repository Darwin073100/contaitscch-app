import type { Clock } from '@/core/clock/Clock';
import type { DomainEventBus } from '@/core/events/DomainEventBus';
import { err, ok, type Result } from '@/core/result/Result';
import type { UnitOfWork } from '@/core/transaction/UnitOfWork';
import type { CourseProgress } from '@/features/learning';

import type { GradableQuiz, QuizResult } from '../entities/Quiz';
import { applyResult, isPassing } from '../policies/ProgressRules';
import { canTakeQuiz } from '../policies/QuizAccessPolicy';
import type { CourseProgressSource } from '../repositories/CourseProgressSource';
import type { QuizProgressRepository } from '../repositories/QuizProgressRepository';
import type { QuizReader } from '../repositories/QuizReader';

export type SubmitQuizError = 'QUIZ_NOT_FOUND' | 'QUIZ_LOCKED' | 'INCOMPLETE_ANSWERS';

export type SubmitQuizInput = {
  quizId: number;
  /** Opción elegida por id de pregunta. */
  answers: Record<number, number>;
};

function score(quiz: GradableQuiz, answers: Record<number, number>): number {
  return quiz.questions.filter((q) => answers[q.id] === quiz.answerKey[q.id]?.correctOptionId)
    .length;
}

/** Nivel del tema del ejercicio que pasó de no completado a completado. */
function levelCompleted(
  quiz: GradableQuiz,
  before: CourseProgress,
  after: CourseProgress,
): number | null {
  const levelId = after.lessons.find((l) => l.topicId === quiz.topicId)?.levelId;
  if (levelId === undefined) return null;
  const wasDone = before.levels.find((l) => l.levelId === levelId)?.state === 'done';
  const isDone = after.levels.find((l) => l.levelId === levelId)?.state === 'done';
  return !wasDone && isDone ? levelId : null;
}

/**
 * Termina un intento: califica, guarda el avance (pendiente de sincronizar) y avisa a las demás
 * features. Reprobar un ejercicio ya aprobado no quita el avance.
 */
export class SubmitQuizUseCase {
  constructor(
    private readonly quizzes: QuizReader,
    private readonly progress: QuizProgressRepository,
    private readonly uow: UnitOfWork,
    private readonly course: CourseProgressSource,
    private readonly clock: Clock,
    private readonly events: DomainEventBus,
  ) {}

  async execute({
    quizId,
    answers,
  }: SubmitQuizInput): Promise<Result<QuizResult, SubmitQuizError>> {
    const quiz = await this.quizzes.findQuiz(quizId);
    if (!quiz) return err('QUIZ_NOT_FOUND');
    const before = await this.course.execute();
    if (!canTakeQuiz(quiz, before)) return err('QUIZ_LOCKED');
    if (quiz.questions.some((q) => answers[q.id] === undefined)) return err('INCOMPLETE_ANSWERS');

    const points = score(quiz, answers);
    const { current, next } = await this.uow.run(async (tx) => {
      const saved = await this.progress.find(quizId, tx);
      const updated = applyResult(saved, {
        quizId,
        score: points,
        passMark: quiz.passMark,
        at: this.clock.nowIso(),
      });
      await this.progress.save(updated, tx);
      return { current: saved, next: updated };
    });

    const after = await this.course.execute();
    const result: QuizResult = {
      quizId,
      kind: quiz.kind,
      score: points,
      total: quiz.questions.length,
      passMark: quiz.passMark,
      passedNow: isPassing(points, quiz.passMark),
      wasPassed: current?.passed ?? false,
      attempt: next.attempts,
      bestScore: next.bestScore,
      levelJustCompleted: quiz.kind === 'topic' ? levelCompleted(quiz, before, after) : null,
      finalExamJustUnlocked: !before.finalExamUnlocked && after.finalExamUnlocked,
    };

    this.events.publish({ type: 'ProgressChanged', quizId });
    if (result.levelJustCompleted !== null) {
      this.events.publish({ type: 'LevelCompleted', levelId: result.levelJustCompleted });
    }
    if (quiz.kind === 'final' && result.passedNow && !result.wasPassed) {
      this.events.publish({ type: 'FinalExamPassed' });
    }
    return ok(result);
  }
}
