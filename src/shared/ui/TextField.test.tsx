import { fireEvent, render, screen } from '@testing-library/react-native';

import { TextField } from './TextField';

describe('TextField', () => {
  it('muestra el mensaje de error', async () => {
    await render(<TextField label="Nombre" error="Mínimo 3 caracteres" />);

    expect(screen.getByText('Mínimo 3 caracteres')).toBeTruthy();
  });

  it('permite ver la contraseña', async () => {
    await render(<TextField label="Contraseña" secureTextEntry />);

    expect(screen.getByLabelText('Contraseña')).toHaveProp('secureTextEntry', true);

    await fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));

    expect(screen.getByLabelText('Contraseña')).toHaveProp('secureTextEntry', false);
  });
});
