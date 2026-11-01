import { fireEvent, render, screen } from '@testing-library/react-native';

import type { LevelCardVm } from '../viewmodels/levelCardVm';
import { LevelCard } from './LevelCard';

const base: LevelCardVm = {
  id: 1,
  name: 'Nivel Básico',
  subtitle: 'Fundamentos y Cuentas',
  description: 'Domina la estructura del Activo.',
  icon: 'bank-outline',
  status: 'inProgress',
  statusLabel: 'En curso',
  topicsLabel: '3/6 Temas',
  progress: 0.5,
  progressLabel: '50% Completado',
  actionLabel: 'Continuar Nivel',
  accessibilityLabel: 'Nivel Básico',
};

describe('LevelCard', () => {
  it('nivel en curso: muestra progreso y el botón responde', async () => {
    const onPress = jest.fn();
    await render(<LevelCard level={base} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar Nivel' }));

    expect(screen.getByText('50% Completado')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 50 });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('nivel bloqueado: sin progreso, con aviso y botón deshabilitado', async () => {
    const onPress = jest.fn();
    await render(
      <LevelCard
        level={{
          ...base,
          name: 'Nivel Intermedio',
          status: 'locked',
          statusLabel: 'Bloqueado',
          actionLabel: 'Bloqueado',
          unlockHint: {
            text: 'Requiere aprobar el Test de Nivel Básico para desbloquear.',
            emphasis: 'next',
          },
        }}
        onPress={onPress}
      />,
    );

    const button = screen.getByRole('button', { name: 'Bloqueado' });
    await fireEvent.press(button);

    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(
      screen.getByText('Requiere aprobar el Test de Nivel Básico para desbloquear.'),
    ).toBeTruthy();
    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });
});
