import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';
import { err, ok } from '@/core/result/Result';

import { RegisterScreen } from './RegisterScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

let mockContainer: Container;
jest.mock('@/composition/providers/AppProviders', () => ({
  useContainer: () => mockContainer,
}));

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

async function fillValidForm() {
  await fireEvent.changeText(screen.getByLabelText('Nombre(s) *'), 'Carlos');
  await fireEvent.changeText(screen.getByLabelText('Apellidos *'), 'Gómez Morales');
  await fireEvent.changeText(screen.getByLabelText('Correo Electrónico *'), 'Carlos@Correo.com');
  await fireEvent.changeText(screen.getByLabelText('Contraseña *'), 'secreta1');
  await fireEvent.changeText(screen.getByLabelText('País *'), 'México');
  await fireEvent.changeText(screen.getByLabelText('Estado *'), 'Veracruz');
}

const session = {
  userId: 'id-1',
  apiToken: 'token-1',
  email: 'carlos@correo.com',
  emailVerified: false,
};

describe('RegisterScreen', () => {
  let registerUser: jest.Mock;
  let requestCode: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockContainer = await createTestContainer({ session: null });
    registerUser = jest.fn().mockResolvedValue(ok(session));
    requestCode = jest.fn().mockResolvedValue(ok({ sent: true, resendInSeconds: 45 }));
    mockContainer.auth.registerUser.execute = registerUser;
    mockContainer.auth.requestVerificationCode.execute = requestCode;
  });

  it('muestra los errores de validación y no llama al servidor', async () => {
    await renderScreen();

    await submit();

    expect(await screen.findAllByText('Mínimo 3 caracteres')).toHaveLength(3);
    expect(screen.getByText('El país es obligatorio')).toBeTruthy();
    expect(registerUser).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('crea la cuenta con los datos normalizados, pide el código y avanza a la verificación', async () => {
    await renderScreen();
    await fillValidForm();

    await submit();

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/verificar-correo',
        params: { resendIn: '45' },
      }),
    );
    expect(registerUser).toHaveBeenCalledWith({
      firstName: 'Carlos',
      lastName: 'Gómez Morales',
      email: 'carlos@correo.com',
      password: 'secreta1',
      country: 'México',
      state: 'Veracruz',
      city: null,
    });
    expect(requestCode).toHaveBeenCalledTimes(1);
  });

  it('si el correo no sale, avanza igual y la verificación permitirá reenviar', async () => {
    requestCode.mockResolvedValue(err('SEND_FAILED'));
    await renderScreen();
    await fillValidForm();

    await submit();

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/verificar-correo',
        params: { resendIn: '0', sendFailed: '1' },
      }),
    );
  });

  it('correo ya registrado: lo marca en el campo y no avanza', async () => {
    registerUser.mockResolvedValue(err('EMAIL_TAKEN'));
    await renderScreen();
    await fillValidForm();

    await submit();

    expect(
      await screen.findByText('Este correo ya tiene una cuenta. Inicia sesión con él.'),
    ).toBeTruthy();
    expect(requestCode).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('sin conexión: muestra el aviso y no avanza', async () => {
    registerUser.mockResolvedValue(err('NETWORK'));
    await renderScreen();
    await fillValidForm();

    await submit();

    expect(await screen.findByText(/Necesitas conexión a internet/)).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });
});
