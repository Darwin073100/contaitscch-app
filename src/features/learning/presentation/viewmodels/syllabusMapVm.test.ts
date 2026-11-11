import type { Syllabus, SyllabusTopic } from '../../domain/entities/Syllabus';
import { toSyllabusMapVm } from './syllabusMapVm';

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

const syllabus = (topics: SyllabusTopic[], examStatus: Syllabus['examStatus']): Syllabus => ({
  level: { id: 1, sortOrder: 1, title: 'Fundamentos', description: 'Meta del nivel' },
  topics,
  completedTopics: topics.filter((t) => t.status === 'completed').length,
  totalTopics: topics.length,
  activeTopic: topics.find((t) => t.status === 'active') ?? null,
  examStatus,
});

describe('toSyllabusMapVm', () => {
  it('arma la tarjeta del nivel con el avance', () => {
    const vm = toSyllabusMapVm(
      syllabus(
        [topic(1, 'completed'), topic(2, 'completed'), topic(3, 'active'), topic(4, 'locked')],
        'locked',
      ),
    );

    expect(vm.header).toMatchObject({
      overline: 'Nivel 1',
      levelName: 'Nivel 1',
      progress: 0.5,
      progressLabel: '2 de 4 temas aprobados',
      percentLabel: '50%',
    });
  });

  it('el tema activo lleva globo y es el destino de la barra inferior', () => {
    const vm = toSyllabusMapVm(syllabus([topic(1, 'completed'), topic(2, 'active')], 'locked'));

    expect(vm.nodes[1]).toMatchObject({ label: '2. Tema 2', hint: '¡Toca para empezar!' });
    expect(vm.nodes[0].hint).toBeUndefined();
    expect(vm.continueAction).toMatchObject({
      caption: 'Tema actual',
      target: { kind: 'topic', topicId: 102 },
    });
  });

  it('un tema reprobado invita a volver a tomarlo', () => {
    const vm = toSyllabusMapVm(syllabus([topic(1, 'active', true)], 'locked'));

    expect(vm.nodes[0].hint).toBe('¡Vuelve a tomarla!');
    expect(vm.nodes[0].accessibilityLabel).toContain('por aprobar');
    expect(vm.continueAction?.caption).toBe('Por aprobar');
  });

  it('sin barra inferior cuando el nivel ya está aprobado', () => {
    const vm = toSyllabusMapVm(syllabus([topic(1, 'completed')], 'passed'));

    expect(vm.exam.title).toBe('Fin del Nivel 1');
    expect(vm.continueAction).toBeNull();
  });
});
