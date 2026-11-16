import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';

import { HomeScreen } from './HomeScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn() },
  // En pruebas la pantalla siempre está enfocada
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
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
      <HomeScreen header={null} />
    </SafeAreaProvider>,
  );

describe('HomeScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // Nivel 1 aprobado
    mockContainer = await createTestContainer({ completedTopics: [101, 102, 103, 104] });
  });

  it('saluda, muestra el avance y el siguiente tema del curso', async () => {
    await renderScreen();

    expect(await screen.findByText('Hola, Ana')).toBeTruthy();
    expect(screen.getByLabelText('Temas aprobados: 4/24')).toBeTruthy();
    expect(screen.getByLabelText('Nivel actual: 2 de 6')).toBeTruthy();
    expect(screen.getByLabelText('Examen final: Bloqueado')).toBeTruthy();
    expect(screen.getByText('Tu siguiente tema · Nivel 2')).toBeTruthy();
    expect(screen.getByText('17%')).toBeTruthy();
    expect(screen.getByText('Se desbloquea cuando apruebes los 24 temas. Llevas 4.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /Continuar/ }));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/tema/[topicId]',
      params: { topicId: '201' },
    });
  });

  it('el nivel aprobado se puede repasar y abre su ruta', async () => {
    await renderScreen();
    await screen.findByText('Hola, Ana');

    await fireEvent.press(screen.getByRole('button', { name: /Repasar nivel/ }));

    expect(router.navigate).toHaveBeenCalledWith({
      pathname: '/aprender',
      params: { level: '1' },
    });
  });
});
