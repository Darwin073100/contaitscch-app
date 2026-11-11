import type { CourseProgress } from '@/features/learning';

import type { Quiz } from '../entities/Quiz';

/**
 * El ejercicio de un tema se presenta si el tema está desbloqueado (también para repasar uno ya
 * aprobado); el examen integrador, con todos los temas aprobados.
 */
export function canTakeQuiz(quiz: Pick<Quiz, 'kind' | 'topicId'>, course: CourseProgress): boolean {
  if (quiz.kind === 'final') return course.finalExamUnlocked;
  const lesson = course.lessons.find((l) => l.topicId === quiz.topicId);
  return lesson !== undefined && lesson.state !== 'locked';
}
