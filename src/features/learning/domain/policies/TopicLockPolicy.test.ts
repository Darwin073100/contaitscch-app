import type { TopicProgress } from '../entities/Syllabus';
import { resolveExamStatus, resolveTopicStatuses } from './TopicLockPolicy';

const topic = (sortOrder: number, completed = false): TopicProgress => ({
  id: 100 + sortOrder,
  title: `Tema ${sortOrder}`,
  sortOrder,
  completed,
  viewedSubtopics: 0,
  totalSubtopics: 3,
});

const statuses = (topics: TopicProgress[]) => resolveTopicStatuses(topics).map((t) => t.status);

describe('resolveTopicStatuses', () => {
  it('el primer tema está abierto y los demás bloqueados para un usuario nuevo', () => {
    expect(statuses([topic(1), topic(2), topic(3)])).toEqual(['active', 'locked', 'locked']);
  });

  it('desbloquea el tema siguiente al último completado', () => {
    expect(statuses([topic(1, true), topic(2, true), topic(3), topic(4)])).toEqual([
      'completed',
      'completed',
      'active',
      'locked',
    ]);
  });

  it('ordena por sortOrder aunque lleguen desordenados', () => {
    const result = resolveTopicStatuses([topic(2), topic(1, true)]);

    expect(result.map((t) => [t.sortOrder, t.status])).toEqual([
      [1, 'completed'],
      [2, 'active'],
    ]);
  });

  it('respeta temas completados fuera de orden (progreso restaurado)', () => {
    expect(statuses([topic(1, true), topic(2), topic(3, true), topic(4)])).toEqual([
      'completed',
      'active',
      'completed',
      'active',
    ]);
  });
});

describe('resolveExamStatus', () => {
  it('bloqueado mientras falte algún tema', () => {
    expect(resolveExamStatus([topic(1, true), topic(2)], false)).toBe('locked');
  });

  it('disponible con todos los temas completados', () => {
    expect(resolveExamStatus([topic(1, true), topic(2, true)], false)).toBe('available');
  });

  it('aprobado tiene prioridad', () => {
    expect(resolveExamStatus([topic(1, true)], true)).toBe('passed');
  });

  it('un nivel sin temas no habilita el examen', () => {
    expect(resolveExamStatus([], false)).toBe('locked');
  });
});
