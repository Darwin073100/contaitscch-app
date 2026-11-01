import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AboutScreen } from './AboutScreen';

jest.mock('expo-router', () => ({
  router: { navigate: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn() },
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AboutScreen />
    </SafeAreaProvider>,
  );

describe('AboutScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('muestra el equipo del proyecto', async () => {
    await renderScreen();

    for (const name of [
      'Doc. Maribel Domínguez Vargas',
      'Fátima Amada Ponce Martínez',
      'Benelly Jolette Caballero Morales',
      'Diego Cervantes Santana',
      'Ing. Edwin Garcia Quiterio',
    ]) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it('"¡Comenzar a Aprender!" lleva a la pestaña Aprender', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: '¡Comenzar a Aprender!' }));

    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  it('regresar sin historial abre Niveles', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);
    await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Regresar' }));

    expect(router.replace).toHaveBeenCalledWith('/niveles');
  });
});
