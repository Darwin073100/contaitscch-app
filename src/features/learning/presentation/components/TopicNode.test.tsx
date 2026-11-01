import { fireEvent, render, screen } from '@testing-library/react-native';

import { TopicNode } from './TopicNode';

describe('TopicNode', () => {
  it('el tema activo muestra el globo y responde al toque', async () => {
    const onPress = jest.fn();
    await render(
      <TopicNode
        label="4. Cuentas T"
        status="active"
        hint="¡Toca para continuar! 2/3"
        accessibilityLabel="Tema 4: Cuentas T. En curso"
        onPress={onPress}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Tema 4: Cuentas T. En curso' }));

    expect(screen.getByText('¡Toca para continuar! 2/3')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('un tema bloqueado está deshabilitado', async () => {
    const onPress = jest.fn();
    await render(
      <TopicNode
        label="5. Balanza"
        status="locked"
        accessibilityLabel="Tema 5: Balanza. Bloqueado"
        onPress={onPress}
      />,
    );

    const node = screen.getByRole('button', { name: 'Tema 5: Balanza. Bloqueado' });
    await fireEvent.press(node);

    expect(node).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });
});
