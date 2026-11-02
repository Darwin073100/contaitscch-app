import { loadCourse } from './loadCourse';

describe('loadCourse', () => {
  it('carga y valida el contenido del bundle', () => {
    const course = loadCourse();

    expect(course.version).toBeGreaterThanOrEqual(1);
    expect(course.levels.map((l) => l.level.name)).toEqual(['Básico', 'Intermedio', 'Avanzado']);
  });

  it('el nivel Básico tiene sus 6 temas y un examen de al menos 10 preguntas', () => {
    const [basico] = loadCourse().levels;

    expect(basico.topics.map((t) => t.id)).toEqual([101, 102, 103, 104, 105, 106]);
    expect(basico.exam?.questions.length).toBeGreaterThanOrEqual(10);
  });
});
