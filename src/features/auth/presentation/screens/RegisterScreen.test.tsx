import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RegisterScreen } from './RegisterScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <RegisterScreen />
    </SafeAreaProvider>,
  );

const submit = () =>
  fireEvent.press(screen.getByRole('button', { name: 'Crear Cuenta y Recibir Código' }));

describe('RegisterScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('muestra los errores de validación y no avanza', async () => {
    await renderScreen();

    await submit();

    expect(await screen.findAllByText('Mínimo 3 caracteres')).toHaveLength(3);
    expect(screen.getByText('El país es obligatorio')).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('con datos válidos avanza a la verificación con el correo normalizado', async () => {
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText('Nombre(s) *'), 'Carlos');
    await fireEvent.changeText(screen.getByLabelText('Apellidos *'), 'Gómez Morales');
    await fireEvent.changeText(screen.getByLabelText('Correo Electrónico *'), 'Carlos@Correo.com');
    await fireEvent.changeText(screen.getByLabelText('Contraseña *'), 'secreta1');
    await fireEvent.changeText(screen.getByLabelText('País *'), 'México');
    await fireEvent.changeText(screen.getByLabelText('Estado *'), 'Veracruz');
    await submit();

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/verificar-correo',
        params: { email: 'carlos@correo.com' },
      }),
    );
  });
});
