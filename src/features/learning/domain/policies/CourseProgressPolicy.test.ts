import type { LessonRecord } from '../entities/CourseProgress';
import { buildCourseProgress } from './CourseProgressPolicy';

/** Curso de 2 niveles × 2 temas; `passed` y `attempts` por id de tema. */
function course(passed: number[] = [], attempts: Record<number, number> = {}): LessonRecord[] {
  return [101, 102, 201, 202].map((topicId) => ({
    topicId,
    levelId: Math.floor(topicId / 100),
    levelOrder: Math.floor(topicId / 100),
    order: topicId % 100,
    title: `Tema ${topicId}`,
    passed: passed.includes(topicId),
    attempts: attempts[topicId] ?? (passed.includes(topicId) ? 1 : 0),
    bestScore: passed.includes(topicId) ? 2 : 0,
  }));
}

const states = (records: LessonRecord[]) =>
  buildCourseProgress(records).lessons.map((l) => `${l.topicId}:${l.state}`);

describe('buildCourseProgress', () => {
  it('sin avance: solo el primer tema está abierto', () => {
    const progress = buildCourseProgress(course());

    expect(states(course())).toEqual(['101:current', '102:locked', '201:locked', '202:locked']);
    expect(progress.levels.map((l) => l.state)).toEqual(['current', 'locked']);
    expect(progress.nextLesson?.topicId).toBe(101);
    expect(progress.currentLevelId).toBe(1);
    expect(progress.finalExamUnlocked).toBe(false);
  });

  it('aprobar el último tema de un nivel abre el primero del siguiente y completa el nivel', () => {
    const progress = buildCourseProgress(course([101, 102]));

    expect(states(course([101, 102]))).toEqual([
      '101:done',
      '102:done',
      '201:current',
      '202:locked',
    ]);
    expect(progress.levels).toEqual([
      { levelId: 1, levelOrder: 1, passedCount: 2, totalCount: 2, state: 'done' },
      { levelId: 2, levelOrder: 2, passedCount: 0, totalCount: 2, state: 'current' },
    ]);
    expect(progress.currentLevelId).toBe(2);
    expect(progress.passedCount).toBe(2);
  });

  it('un tema con intentos sin aprobar queda "por aprobar" y bloquea a los siguientes', () => {
    expect(states(course([101], { 102: 3 }))).toEqual([
      '101:done',
      '102:retry',
      '201:locked',
      '202:locked',
    ]);
  });

  it('un tema bloqueado con intentos sigue bloqueado', () => {
    // Puede pasar tras fusionar avances de dos teléfonos: manda la regla de desbloqueo
    expect(states(course([], { 201: 1 }))[2]).toBe('201:locked');
  });

  it('todo aprobado: sin siguiente tema, nivel actual = el último y examen final abierto', () => {
    const progress = buildCourseProgress(course([101, 102, 201, 202]));

    expect(progress.nextLesson).toBeNull();
    expect(progress.currentLevelId).toBe(2);
    expect(progress.finalExamUnlocked).toBe(true);
  });

  it('ordena por nivel y tema aunque el repositorio entregue otro orden', () => {
    const shuffled = course([101]).reverse();

    expect(buildCourseProgress(shuffled).lessons.map((l) => l.index)).toEqual([0, 1, 2, 3]);
    expect(states(shuffled)[1]).toBe('102:current');
  });

  it('sin contenido no hay nivel actual ni examen', () => {
    const progress = buildCourseProgress([]);

    expect(progress.currentLevelId).toBeNull();
    expect(progress.finalExamUnlocked).toBe(false);
  });
});
