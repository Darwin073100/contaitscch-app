import { buildCourseProgress } from '../../domain/policies/CourseProgressPolicy';
import type { Syllabus, SyllabusTopic } from '../../domain/entities/Syllabus';
import { courseRecords } from '../../domain/testing/courseRecords';
import { shortTitle, toSyllabusMapVm } from './syllabusMapVm';

const topic = (
  sortOrder: number,
  status: SyllabusTopic['status'],
  retry = false,
): SyllabusTopic => ({
  id: 100 + sortOrder,
  title: `Tema ${sortOrder}`,
  sortOrder,
  status,
  retry,
});

const syllabus = (
  topics: SyllabusTopic[],
  examStatus: Syllabus['examStatus'] = 'locked',
  levelId = 1,
): Syllabus => ({
  level: { id: levelId, sortOrder: levelId, title: 'Fundamentos', description: 'Meta' },
  topics,
  completedTopics: topics.filter((t) => t.status === 'completed').length,
  totalTopics: topics.length,
  activeTopic: topics.find((t) => t.status === 'active') ?? null,
  examStatus,
});

const course = (passed: number[] = [], attempts: Record<number, number> = {}) =>
  buildCourseProgress(courseRecords({ passed, attempts }));

describe('toSyllabusMapVm', () => {
  it('arma la tarjeta del nivel y los chips de nivel', () => {
    const vm = toSyllabusMapVm(
      syllabus([
        topic(1, 'completed'),
        topic(2, 'completed'),
        topic(3, 'active'),
        topic(4, 'locked'),
      ]),
      course([101, 102]),
    );

    expect(vm.header).toMatchObject({
      overline: 'Nivel 1',
      levelName: '4 temas',
      progressLabel: '2 de 4 temas aprobados',
      percentLabel: '50%',
    });
    expect(vm.levelTabs.map((t) => [t.label, t.state, t.selected])).toEqual([
      ['Nivel 1', 'current', true],
      ['Nivel 2', 'locked', false],
    ]);
  });

  it('globos: empezar, continuar y volver a tomar', () => {
    expect(toSyllabusMapVm(syllabus([topic(1, 'active')]), course()).nodes[0].hint).toBe(
      'Empieza aquí',
    );
    expect(
      toSyllabusMapVm(syllabus([topic(1, 'completed'), topic(2, 'active')]), course([101])).nodes[1]
        .hint,
    ).toBe('Toca para continuar');

    const retry = toSyllabusMapVm(syllabus([topic(1, 'active', true)]), course([], { 101: 1 }));
    expect(retry.nodes[0]).toMatchObject({ status: 'retry', hint: 'Vuelve a tomarla' });
  });

  it('la barra inferior lleva al siguiente tema de todo el curso', () => {
    const vm = toSyllabusMapVm(syllabus([topic(1, 'completed')]), course([101], { 102: 2 }));

    expect(vm.continueAction).toEqual({
      caption: 'Por aprobar · Nivel 1',
      title: 'Tema 102',
      actionLabel: 'Retomar',
      retry: true,
      target: { kind: 'topic', topicId: 102 },
    });
  });

  it('la meta del nivel abre el siguiente; la del último, el examen integrador', () => {
    const done = syllabus([topic(1, 'completed')], 'passed');
    expect(toSyllabusMapVm(done, course([101])).goal).toMatchObject({
      title: 'Fin del Nivel 1',
      caption: 'Toca para abrir el Nivel 2',
      status: 'available',
      target: { kind: 'level', levelId: 2 },
    });

    const last = toSyllabusMapVm(syllabus([topic(1, 'locked')], 'locked', 2), course());
    expect(last.goal).toMatchObject({
      title: 'Examen integrador final',
      status: 'locked',
      target: { kind: 'exam' },
    });
  });

  it('todo aprobado: la barra lleva al examen integrador', () => {
    const all = [101, 102, 103, 104, 201, 202, 203, 204];
    const vm = toSyllabusMapVm(syllabus([topic(1, 'completed')], 'passed', 2), course(all));

    expect(vm.continueAction).toMatchObject({ actionLabel: 'Presentar', target: { kind: 'exam' } });
  });
});

describe('shortTitle', () => {
  it('quita paréntesis y lo que sigue a los dos puntos', () => {
    expect(shortTitle('Cuentas T (Esquemas de Mayor): cargo y abono')).toBe('Cuentas T');
  });
});
