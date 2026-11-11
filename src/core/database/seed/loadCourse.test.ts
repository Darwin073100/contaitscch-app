import { FINAL_EXAM_ID } from './courseSchema';
import { loadCourse } from './loadCourse';

describe('loadCourse', () => {
  it('carga y valida el contenido del bundle', () => {
    const course = loadCourse();

    expect(course.version).toBeGreaterThanOrEqual(3);
    expect(course.levels.map((l) => l.level.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(course.finalExam.id).toBe(FINAL_EXAM_ID);
    expect(course.glossary.length).toBeGreaterThan(0);
  });

  it('el Nivel 1 tiene sus 4 temas con ejercicio', () => {
    const [nivel1] = loadCourse().levels;

    expect(nivel1.topics.map((t) => t.id)).toEqual([101, 102, 103, 104]);
    expect(nivel1.topics.every((t) => t.quiz.questions.length > 0)).toBe(true);
  });
});
