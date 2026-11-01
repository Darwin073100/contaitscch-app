import type { LevelOverviewItem } from '../../domain/entities/Level';
import { toLevelCardVm } from './levelCardVm';

const level = (
  sortOrder: number,
  status: LevelOverviewItem['status'],
  completedTopics = 0,
): LevelOverviewItem => ({
  id: sortOrder,
  name: ['Básico', 'Intermedio', 'Avanzado'][sortOrder - 1],
  sortOrder,
  subtitle: 'Sub',
  description: 'Desc',
  completedTopics,
  totalTopics: 6,
  examPassed: status === 'completed',
  status,
  progress: status === 'completed' ? 1 : completedTopics / 6,
});

describe('toLevelCardVm', () => {
  it('nivel en curso: temas, porcentaje y "Continuar Nivel"', () => {
    const vm = toLevelCardVm(level(1, 'inProgress', 3));

    expect(vm).toMatchObject({
      name: 'Nivel Básico',
      icon: 'bank-outline',
      statusLabel: 'En curso',
      topicsLabel: '3/6 Temas',
      progressLabel: '50% Completado',
      actionLabel: 'Continuar Nivel',
    });
    expect(vm.unlockHint).toBeUndefined();
  });

  it('nivel abierto sin avance invita a empezar', () => {
    expect(toLevelCardVm(level(1, 'inProgress')).actionLabel).toBe('Empezar Nivel');
  });

  it('nivel completado se puede repasar', () => {
    expect(toLevelCardVm(level(1, 'completed', 6))).toMatchObject({
      statusLabel: 'Completado',
      progressLabel: '100% Completado',
      actionLabel: 'Repasar Nivel',
    });
  });

  it('el siguiente nivel bloqueado pide aprobar el test del anterior', () => {
    const vm = toLevelCardVm(level(2, 'locked'), level(1, 'inProgress', 3));

    expect(vm.unlockHint).toEqual({
      text: 'Requiere aprobar el Test de Nivel Básico para desbloquear.',
      emphasis: 'next',
    });
  });

  it('un nivel bloqueado detrás de otro bloqueado lleva aviso tenue', () => {
    const vm = toLevelCardVm(level(3, 'locked'), level(2, 'locked'));

    expect(vm.unlockHint).toEqual({
      text: 'Desbloquea completando satisfactoriamente el Nivel Intermedio.',
      emphasis: 'later',
    });
  });
});
