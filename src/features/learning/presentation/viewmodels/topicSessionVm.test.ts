import type { TopicSession } from '../../domain/entities/TopicSession';
import { toTopicStepVm } from './topicSessionVm';

const session = (overrides: Partial<TopicSession> = {}): TopicSession => ({
  level: { id: 1, name: 'Básico', sortOrder: 1 },
  topic: { id: 104, title: 'Cuentas T (Esquemas de Mayor)', sortOrder: 4 },
  subtopics: [1, 2, 3, 4].map((n) => ({
    id: 10400 + n,
    title: `Subtema ${n}`,
    sortOrder: n,
    blocks: [{ type: 'paragraph', text: `Texto ${n}` }],
  })),
  completed: false,
  startStep: 0,
  ...overrides,
});

describe('toTopicStepVm', () => {
  it('arma los textos del paso intermedio (captura: paso 2 de 4)', () => {
    const vm = toTopicStepVm(session(), 1);

    expect(vm).toMatchObject({
      headerTitle: 'Cuentas T (Esquemas de Mayor)',
      badge: 'Módulo 1 • Tema 4',
      stepLabel: 'Paso 2 de 4',
      progress: 0.5,
      title: 'Subtema 2',
      canGoBack: true,
      isLast: false,
      primaryLabel: 'Continuar',
      primaryIcon: 'arrow-right',
    });
  });

  it('el primer paso no permite regresar', () => {
    expect(toTopicStepVm(session(), 0).canGoBack).toBe(false);
  });

  it('el último paso completa el tema; en repaso lo termina', () => {
    expect(toTopicStepVm(session(), 3)).toMatchObject({
      isLast: true,
      primaryLabel: 'Completar tema',
      primaryIcon: 'check-bold',
      progress: 1,
    });

    const review = toTopicStepVm(session({ completed: true }), 3);
    expect(review.primaryLabel).toBe('Terminar repaso');
  });

  it('recorta el paso fuera de rango', () => {
    expect(toTopicStepVm(session(), 9).stepLabel).toBe('Paso 4 de 4');
    expect(toTopicStepVm(session(), -2).stepLabel).toBe('Paso 1 de 4');
  });
});
