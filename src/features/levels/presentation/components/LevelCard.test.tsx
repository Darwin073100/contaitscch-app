import { fireEvent, render, screen } from '@testing-library/react-native';

import type { LevelCardVm } from '../viewmodels/levelCardVm';
import { LevelCard } from './LevelCard';

const base: LevelCardVm = {
  id: 1,
  name: 'Nivel 1',
  subtitle: 'Fundamentos y Cuentas',
  description: 'Domina la estructura del Activo.',
  icon: 'bank-outline',
  status: 'inProgress',
  statusLabel: 'En curso',
  topicsLabel: '3/6 Temas',
  progress: 0.5,
  progressLabel: '2 de 4',
  actionLabel: 'Continuar nivel',
  accessibilityLabel: 'Nivel Básico',
};

describe('LevelCard', () => {
  it('nivel en curso: muestra progreso y el botón responde', async () => {
    const onPress = jest.fn();
    await render(<LevelCard level={base} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar nivel' }));

    expect(screen.getByText('2 de 4')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 50 });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('nivel bloqueado: sin progreso ni botón, solo el aviso de desbloqueo', async () => {
    await render(
      <LevelCard
        level={{
          ...base,
          name: 'Nivel 2',
          status: 'locked',
          statusLabel: 'Bloqueado',
          actionLabel: 'Bloqueado',
          unlockHint: {
            text: 'Se desbloquea al aprobar los 4 temas del Nivel 1.',
            emphasis: 'next',
          },
        }}
        onPress={jest.fn()}
      />,
    );

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Se desbloquea al aprobar los 4 temas del Nivel 1.')).toBeTruthy();
  });
});
