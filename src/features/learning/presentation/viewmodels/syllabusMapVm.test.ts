import type { Syllabus, SyllabusTopic } from '../../domain/entities/Syllabus';
import { toSyllabusMapVm } from './syllabusMapVm';

const topic = (
  sortOrder: number,
  status: SyllabusTopic['status'],
  viewedSubtopics = 0,
): SyllabusTopic => ({
  id: 100 + sortOrder,
  title: `Tema ${sortOrder}`,
  sortOrder,
  completed: status === 'completed',
  viewedSubtopics,
  totalSubtopics: 3,
  status,
});

const syllabus = (topics: SyllabusTopic[], examStatus: Syllabus['examStatus']): Syllabus => ({
  level: { id: 1, name: 'Básico', sortOrder: 1, title: 'Introducción', description: 'Desc' },
  topics,
  completedTopics: topics.filter((t) => t.status === 'completed').length,
  totalTopics: topics.length,
  activeTopic: topics.find((t) => t.status === 'active') ?? null,
  examStatus,
});

describe('toSyllabusMapVm', () => {
  it('arma la tarjeta del módulo con el progreso', () => {
    const vm = toSyllabusMapVm(
      syllabus(
        [topic(1, 'completed'), topic(2, 'completed'), topic(3, 'active'), topic(4, 'locked')],
        'locked',
      ),
    );

    expect(vm.header).toMatchObject({
      overline: 'Módulo 1',
      progress: 0.5,
      progressLabel: '2 de 4 temas completados',
      percentLabel: '50%',
    });
  });

  it('el tema activo lleva globo con su avance y es el destino de la barra inferior', () => {
    const vm = toSyllabusMapVm(syllabus([topic(1, 'completed'), topic(2, 'active', 2)], 'locked'));

    expect(vm.nodes[1]).toMatchObject({ label: '2. Tema 2', hint: '¡Toca para continuar! 2/3' });
    expect(vm.nodes[0].hint).toBeUndefined();
    expect(vm.continueAction).toMatchObject({
      caption: 'Continuar tema activo',
      target: { kind: 'topic', topicId: 102 },
    });
  });

  it('un tema activo sin abrir invita a empezar', () => {
    const vm = toSyllabusMapVm(syllabus([topic(1, 'active')], 'locked'));

    expect(vm.nodes[0].hint).toBe('¡Toca para empezar!');
    expect(vm.continueAction?.caption).toBe('Siguiente tema');
  });

  it('con todos los temas completados la barra lleva al examen', () => {
    const vm = toSyllabusMapVm(syllabus([topic(1, 'completed')], 'available'));

    expect(vm.continueAction).toMatchObject({
      title: 'Examen Final Básico',
      target: { kind: 'exam' },
    });
  });

  it('sin barra inferior cuando el examen ya está aprobado', () => {
    expect(toSyllabusMapVm(syllabus([topic(1, 'completed')], 'passed')).continueAction).toBeNull();
  });
});
