import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { VerifyEmailScreen } from './VerifyEmailScreen';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn() },
  useLocalSearchParams: () => ({ email: 'carlos@correo.com' }),
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

describe('VerifyEmailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('habilita "Validar" solo con los 6 dígitos y entra al curso', async () => {
    await renderScreen();
    expect(screen.getByText('carlos@correo.com')).toBeTruthy();
    expect(verifyButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Código de verificación'), '724');
    expect(verifyButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Código de verificación'), '724913');
    await fireEvent.press(verifyButton());

    expect(router.replace).toHaveBeenCalledWith('/');
  });

  it('muestra la cuenta regresiva y luego permite reenviar', async () => {
    await renderScreen();
    expect(screen.getByText('Reenviar en 00:45')).toBeTruthy();

    for (let i = 0; i < 45; i++) await act(() => jest.advanceTimersByTime(1000));
    await fireEvent.press(screen.getByRole('button', { name: 'Reenviar código' }));

    expect(screen.getByText('Reenviar en 00:45')).toBeTruthy();
  });

  it('"Corregir mis datos" regresa al paso 1', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Corregir mis datos' }));

    expect(router.back).toHaveBeenCalled();
  });
});
