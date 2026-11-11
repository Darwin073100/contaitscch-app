import type { LevelOverviewItem } from '../../domain/entities/Level';
import { toLevelCardVm } from './levelCardVm';

const level = (
  sortOrder: number,
  status: LevelOverviewItem['status'],
  completedTopics = 0,
): LevelOverviewItem => ({
  id: sortOrder,
  sortOrder,
  title: 'Fundamentos: qué es la contabilidad',
  description: 'Al terminar este nivel…',
  completedTopics,
  totalTopics: 4,
  status,
  progress: completedTopics / 4,
});

describe('toLevelCardVm', () => {
  it('nivel en curso: temas, porcentaje y "Continuar nivel"', () => {
    const vm = toLevelCardVm(level(1, 'inProgress', 2));

    expect(vm).toMatchObject({
      name: 'Nivel 1',
      subtitle: 'Fundamentos: qué es la contabilidad',
      icon: 'feather',
      statusLabel: 'En curso',
      topicsLabel: '2/4 temas',
      progressLabel: '50% aprobado',
      actionLabel: 'Continuar nivel',
    });
    expect(vm.unlockHint).toBeUndefined();
  });

  it('nivel abierto sin avance invita a empezar', () => {
    expect(toLevelCardVm(level(1, 'inProgress')).actionLabel).toBe('Empezar nivel');
  });

  it('nivel aprobado se puede repasar', () => {
    expect(toLevelCardVm(level(1, 'completed', 4))).toMatchObject({
      statusLabel: 'Aprobado',
      progressLabel: '100% aprobado',
      actionLabel: 'Repasar nivel',
    });
  });

  it('el siguiente nivel bloqueado pide aprobar los temas del anterior', () => {
    const vm = toLevelCardVm(level(2, 'locked'), level(1, 'inProgress', 3));

    expect(vm.unlockHint).toEqual({
      text: 'Se desbloquea al aprobar los 4 temas del Nivel 1.',
      emphasis: 'next',
    });
  });

  it('un nivel bloqueado detrás de otro bloqueado lleva aviso tenue', () => {
    const vm = toLevelCardVm(level(3, 'locked'), level(2, 'locked'));

    expect(vm.unlockHint).toMatchObject({ emphasis: 'later' });
  });
});
