import type {
  CourseLesson,
  CourseLevel,
  CourseProgress,
  LessonRecord,
  LessonState,
} from '../entities/CourseProgress';

function lessonState(record: LessonRecord, unlocked: boolean): LessonState {
  if (record.passed) return 'done';
  if (!unlocked) return 'locked';
  return record.attempts > 0 ? 'retry' : 'current';
}

/**
 * Reglas de avance (puras, sin base de datos):
 * - El primer tema del curso siempre está abierto; los demás, si el anterior en el orden global
 *   está aprobado (cruza niveles: N2-L1 se abre al aprobar N1-L4).
 * - Un nivel está completo con todos sus temas aprobados y abierto si su primer tema lo está.
 * - El examen integrador se abre con todos los temas aprobados.
 */
export function buildCourseProgress(records: readonly LessonRecord[]): CourseProgress {
  const sorted = [...records].sort((a, b) => a.levelOrder - b.levelOrder || a.order - b.order);

  const lessons = sorted.map((record, index): CourseLesson => ({
    ...record,
    index,
    state: lessonState(record, index === 0 || sorted[index - 1].passed),
  }));

  const levels: CourseLevel[] = [];
  for (const lesson of lessons) {
    let level = levels.at(-1);
    if (level?.levelId !== lesson.levelId) {
      level = {
        levelId: lesson.levelId,
        levelOrder: lesson.levelOrder,
        passedCount: 0,
        totalCount: 0,
        // El primer tema del nivel decide si está abierto
        state: lesson.state === 'locked' ? 'locked' : 'current',
      };
      levels.push(level);
    }
    level.totalCount++;
    if (lesson.passed) level.passedCount++;
  }
  for (const level of levels) {
    if (level.passedCount === level.totalCount) level.state = 'done';
  }

  const nextLesson = lessons.find((l) => !l.passed) ?? null;
  const passedCount = lessons.filter((l) => l.passed).length;
  return {
    lessons,
    levels,
    nextLesson,
    currentLevelId: nextLesson?.levelId ?? lessons.at(-1)?.levelId ?? null,
    passedCount,
    totalCount: lessons.length,
    finalExamUnlocked: lessons.length > 0 && passedCount === lessons.length,
  };
}
