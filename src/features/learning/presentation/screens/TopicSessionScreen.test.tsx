import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';

import { TopicSessionScreen } from './TopicSessionScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
}));

// Contenedor real sobre SQLite en memoria; uno nuevo por prueba con los temas 101 y 102 aprobados.
let mockContainer: Container;
jest.mock('@/composition/providers/AppProviders', () => ({
  useContainer: () => mockContainer,
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = (topicId: number) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TopicSessionScreen topicId={topicId} />
    </SafeAreaProvider>,
  );

const press = (name: string) => fireEvent.press(screen.getByRole('button', { name }));

describe('TopicSessionScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockContainer = await createTestContainer({ completedTopics: [101, 102] });
  });

  it('abre el tema en el paso 1 con su objetivo', async () => {
    await renderScreen(103);

    expect(await screen.findByText('Paso 1 de 4')).toBeTruthy();
    expect(screen.getByText('Objetivo')).toBeTruthy();
    expect(screen.getByText(/^Distinguir usuarios internos y externos/)).toBeTruthy();
  });

  it('avanza y regresa entre los 4 pasos fijos', async () => {
    await renderScreen(103);
    await screen.findByText('Paso 1 de 4');
    expect(screen.queryByRole('button', { name: 'Paso anterior' })).toBeNull();

    await press('Continuar');
    expect(screen.getByText('Explicación')).toBeTruthy();
    await press('Continuar');
    expect(screen.getByText('La misma tienda, tres miradas')).toBeTruthy();
    await press('Continuar');
    expect(screen.getByText('Paso 4 de 4')).toBeTruthy();
    expect(screen.getByText('Idea clave')).toBeTruthy();
    expect(screen.getByText('Error común')).toBeTruthy();

    await press('Paso anterior');
    expect(screen.getByText('Paso 3 de 4')).toBeTruthy();
  });

  it('al terminar marca el tema como completado y regresa al temario', async () => {
    await renderScreen(103);
    await screen.findByText('Paso 1 de 4');

    await press('Continuar');
    await press('Continuar');
    await press('Continuar');
    await press('Completar tema');

    expect(router.back).toHaveBeenCalled();
    const syllabus = await mockContainer.learning.getSyllabus.execute({ levelId: 1 });
    expect(syllabus.ok && syllabus.value.activeTopic?.id).toBe(104);
  });

  it('un tema sin contenido muestra el aviso y permite volver', async () => {
    // Todos los temas del curso tienen contenido: se usa un id que no existe
    await renderScreen(199);

    expect(
      await screen.findByText('Este tema todavía no tiene contenido disponible.'),
    ).toBeTruthy();
    await press('Volver al temario');

    expect(router.back).toHaveBeenCalled();
  });
});
