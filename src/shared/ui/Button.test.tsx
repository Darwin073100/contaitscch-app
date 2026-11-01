import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  it('muestra la etiqueta y responde al toque', async () => {
    const onPress = jest.fn();
    await render(<Button label="Continuar" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.getByText('Continuar')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('oculta la etiqueta y se deshabilita mientras carga', async () => {
    const onPress = jest.fn();
    await render(<Button label="Entrar" loading onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button'));

    expect(screen.queryByText('Entrar')).toBeNull();
    expect(onPress).not.toHaveBeenCalled();
  });
});
