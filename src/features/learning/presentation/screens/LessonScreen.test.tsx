import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';

import { LessonScreen } from './LessonScreen';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn(), canGoBack: jest.fn(() => true) },
}));

// Contenedor real sobre SQLite en memoria con los temas 101 y 102 aprobados.
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
      <LessonScreen topicId={topicId} />
    </SafeAreaProvider>,
  );

const press = (name: string) => fireEvent.press(screen.getByRole('button', { name }));

describe('LessonScreen', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockContainer = await createTestContainer({ completedTopics: [101, 102] });
  });

  it('paso 1: objetivo, infografía ampliable y cómo se aprueba', async () => {
    await renderScreen(103);

    expect(await screen.findByText('Paso 1 de 4')).toBeTruthy();
    expect(screen.getByText('Nivel 1 · Tema 3')).toBeTruthy();
    expect(screen.getByText(/^Distinguir usuarios internos y externos/)).toBeTruthy();
    expect(screen.getByRole('imagebutton', { name: /Infografía.*Toca para ampliar/ })).toBeTruthy();
    expect(screen.getByText('Cómo se aprueba este tema')).toBeTruthy();
  });

  it('recorre los 4 pasos y al final abre el ejercicio del tema', async () => {
    await renderScreen(103);
    await screen.findByText('Paso 1 de 4');
    expect(screen.queryByRole('button', { name: 'Paso anterior' })).toBeNull();

    await press('Continuar');
    expect(screen.getByText('Explicación')).toBeTruthy();
    await press('Continuar');
    expect(screen.getByText('La misma tienda, tres miradas')).toBeTruthy();
    expect(screen.getByText('Caso práctico')).toBeTruthy();
    await press('Continuar');
    expect(screen.getByText('Idea clave')).toBeTruthy();
    expect(screen.getByText('Error común')).toBeTruthy();
    expect(screen.getByText('Actividad para practicar')).toBeTruthy();

    await press('Ir al ejercicio');
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/ejercicio/[quizId]',
      params: { quizId: '103' },
    });
  });

  it('un tema bloqueado no se abre', async () => {
    await renderScreen(201);

    expect(await screen.findByText(/Este tema aún está bloqueado/)).toBeTruthy();
    await press('Volver a la ruta');
    expect(router.back).toHaveBeenCalled();
  });
});
