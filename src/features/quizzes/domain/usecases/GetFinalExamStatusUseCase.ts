import { err, ok, type Result } from '@/core/result/Result';

import { FINAL_EXAM_ID, type FinalExamStatus } from '../entities/Quiz';
import type { CourseProgressSource } from '../repositories/CourseProgressSource';
import type { QuizProgressRepository } from '../repositories/QuizProgressRepository';
import type { QuizReader } from '../repositories/QuizReader';

export type GetFinalExamStatusError = 'QUIZ_NOT_FOUND';

/** Estado del examen integrador: Bloqueado | Disponible | Por aprobar | Aprobado. */
export class GetFinalExamStatusUseCase {
  constructor(
    private readonly quizzes: QuizReader,
    private readonly progress: QuizProgressRepository,
    private readonly course: CourseProgressSource,
  ) {}

  async execute(): Promise<Result<FinalExamStatus, GetFinalExamStatusError>> {
    const [exam, saved, course] = await Promise.all([
      this.quizzes.findQuiz(FINAL_EXAM_ID),
      this.progress.find(FINAL_EXAM_ID),
      this.course.execute(),
    ]);
    if (!exam) return err('QUIZ_NOT_FOUND');

    const attempts = saved?.attempts ?? 0;
    const status: FinalExamStatus['status'] = saved?.passed
      ? 'passed'
      : !course.finalExamUnlocked
        ? 'locked'
        : attempts > 0
          ? 'pending'
          : 'available';
    return ok({
      status,
      attempts,
      bestScore: saved ? saved.bestScore : null,
      total: exam.questions.length,
      passMark: exam.passMark,
    });
  }
}
