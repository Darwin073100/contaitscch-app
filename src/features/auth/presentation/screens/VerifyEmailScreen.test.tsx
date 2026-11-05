import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';
import { err, ok } from '@/core/result/Result';

import { VerifyEmailScreen } from './VerifyEmailScreen';

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

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
      <VerifyEmailScreen />
    </SafeAreaProvider>,
  );

const verifyButton = () => screen.getByRole('button', { name: 'Validar y Entrar al Curso' });
const typeCode = (code: string) =>
  fireEvent.changeText(screen.getByLabelText('Código de verificación'), code);

describe('VerifyEmailScreen', () => {
  let verifyCode: jest.Mock;
  let requestCode: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockParams = { resendIn: '45' };
    mockContainer = await createTestContainer({
      session: { userId: 'id-1', apiToken: 't', email: 'carlos@correo.com', emailVerified: false },
    });
    verifyCode = jest.fn().mockResolvedValue(ok(undefined));
    requestCode = jest.fn().mockResolvedValue(ok({ sent: true, resendInSeconds: 45 }));
    mockContainer.auth.verifyEmailCode.execute = verifyCode;
    mockContainer.auth.requestVerificationCode.execute = requestCode;
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('muestra el correo de la sesión, habilita "Validar" con 6 dígitos y entra al curso', async () => {
    await renderScreen();
    expect(screen.getByText('carlos@correo.com')).toBeTruthy();
    expect(verifyButton()).toBeDisabled();

    await typeCode('724');
    expect(verifyButton()).toBeDisabled();

    await typeCode('724913');
    await fireEvent.press(verifyButton());

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    expect(verifyCode).toHaveBeenCalledWith('724913');
  });

  it('código incorrecto: muestra el aviso y limpia las casillas', async () => {
    verifyCode.mockResolvedValue(err('INVALID_CODE'));
    await renderScreen();

    await typeCode('111111');
    await fireEvent.press(verifyButton());

    expect(await screen.findByText('Código incorrecto, revisa tu correo.')).toBeTruthy();
    expect(verifyButton()).toBeDisabled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('código vencido: pide uno nuevo y lo avisa', async () => {
    verifyCode.mockResolvedValue(err('EXPIRED'));
    await renderScreen();

    await typeCode('111111');
    await fireEvent.press(verifyButton());

    expect(await screen.findByText('El código venció, te enviamos uno nuevo.')).toBeTruthy();
    expect(requestCode).toHaveBeenCalledTimes(1);
  });

  it('muestra la cuenta regresiva y luego permite reenviar', async () => {
    await renderScreen();
    expect(screen.getByText('Reenviar en 00:45')).toBeTruthy();

    for (let i = 0; i < 45; i++) await act(() => jest.advanceTimersByTime(1000));
    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar código' }));

    expect(await screen.findByText('Te enviamos un código nuevo.')).toBeTruthy();
    expect(screen.getByText('Reenviar en 00:45')).toBeTruthy();
  });

  it('si el código no salió en el registro, avisa y permite reenviar de inmediato', async () => {
    mockParams = { resendIn: '0', sendFailed: '1' };
    await renderScreen();

    expect(screen.getByText(/No pudimos enviar el código/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeTruthy();
  });

  it('"Corregir mis datos" regresa al paso 1', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Corregir mis datos' }));

    expect(router.back).toHaveBeenCalled();
  });
});
