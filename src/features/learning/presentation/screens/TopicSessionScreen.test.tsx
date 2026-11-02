import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createContainer, type Container } from '@/composition/container';

import { TopicSessionScreen } from './TopicSessionScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
}));

// Contenedor real con los repositorios de ejemplo; uno nuevo por prueba (progreso limpio).
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockContainer = createContainer();
  });

  it('retoma en el paso 2 con la Cuenta T y la Regla de Oro (captura)', async () => {
    await renderScreen(104);

    expect(await screen.findByText('Paso 2 de 4')).toBeTruthy();
    expect(screen.getByText('¿Qué es una Cuenta T y cómo funciona?')).toBeTruthy();
    // DEBE y HABER también aparecen en negrita dentro de la Regla de Oro
    expect(screen.getByText('Lado Izquierdo • Cargos')).toBeTruthy();
    expect(screen.getByText('Lado Derecho • Abonos')).toBeTruthy();
    expect(screen.getByText('+ Capital / Ingreso')).toBeTruthy();
    expect(screen.getByText('Regla de Oro de la Partida Doble')).toBeTruthy();
    expect(screen.getByLabelText('Completa el tema para ganar 5 XP')).toBeTruthy();
  });

  it('avanza y regresa entre pasos', async () => {
    await renderScreen(104);
    await screen.findByText('Paso 2 de 4');

    await press('Paso anterior');
    expect(screen.getByText('Paso 1 de 4')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Paso anterior' })).toBeNull();

    await press('Continuar');
    expect(screen.getByText('Paso 2 de 4')).toBeTruthy();
  });

  it('al terminar marca el tema como completado y regresa al temario', async () => {
    await renderScreen(104);
    await screen.findByText('Paso 2 de 4');

    await press('Continuar');
    await press('Continuar');
    expect(screen.getByText('Paso 4 de 4')).toBeTruthy();
    await press('Completar tema');

    expect(router.back).toHaveBeenCalled();
    const syllabus = await mockContainer.learning.getSyllabus.execute({ levelId: 1 });
    expect(syllabus.ok && syllabus.value.activeTopic?.id).toBe(105);
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
