import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';

import { QuizScreen } from './QuizScreen';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    dismissTo: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
}));

// Contenedor real sobre SQLite en memoria, sin avance.
let mockContainer: Container;
jest.mock('@/composition/providers/AppProviders', () => ({
  useContainer: () => mockContainer,
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = (quizId: number) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QuizScreen quizId={quizId} />
    </SafeAreaProvider>,
  );

const press = (name: string | RegExp) => fireEvent.press(screen.getByRole('button', { name }));
const pick = (letter: string) =>
  fireEvent.press(screen.getByRole('radio', { name: new RegExp(`^${letter}\\. `) }));

describe('QuizScreen (ejercicio del tema 101)', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockContainer = await createTestContainer();
  });

  it('acierta las 4 preguntas: tema aprobado y siguiente tema', async () => {
    await renderScreen(101);
    expect(await screen.findByText('1 de 4')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Comprobar' })).toBeDisabled();

    await pick('B');
    await press('Comprobar');
    expect(await screen.findByText('Correcto')).toBeTruthy();
    expect(screen.getByText(/registrar, clasificar, resumir e interpretar/)).toBeTruthy();
    await press('Siguiente pregunta');

    for (const [n, letter] of [
      [2, 'B'],
      [3, 'B'],
      [4, 'D'],
    ] as const) {
      expect(screen.getByText(`${n} de 4`)).toBeTruthy();
      await pick(letter);
      await press('Comprobar');
      await screen.findByText('Correcto');
      await press(n < 4 ? 'Siguiente pregunta' : 'Ver resultado');
    }

    expect(await screen.findByText('¡Tema aprobado!')).toBeTruthy();
    expect(screen.getByLabelText('Aciertos: 4/4')).toBeTruthy();
    await press('Siguiente tema');
    expect(router.dismissTo).toHaveBeenCalledWith({
      pathname: '/tema/[topicId]',
      params: { topicId: '102' },
    });

    const course = await mockContainer.learning.getCourseProgress.execute();
    expect(course.lessons[0]).toMatchObject({ topicId: 101, state: 'done' });
  });

  it('una respuesta incorrecta no revela la correcta y obliga a retomar la lección', async () => {
    await renderScreen(101);
    await screen.findByText('1 de 4');

    await pick('A');
    await press('Comprobar');
    expect(await screen.findByText('Respuesta incorrecta')).toBeTruthy();
    expect(screen.getByText(/podrás repasar el tema y volver a intentarlo/)).toBeTruthy();
    // La retroalimentación (que explica la respuesta) solo aparece al acertar
    expect(screen.queryByText(/registrar, clasificar, resumir e interpretar/)).toBeNull();
    await press('Siguiente pregunta');

    for (const [n, letter] of [
      [2, 'B'],
      [3, 'B'],
      [4, 'D'],
    ] as const) {
      await pick(letter);
      await press('Comprobar');
      await screen.findByText('Correcto');
      await press(n < 4 ? 'Siguiente pregunta' : 'Ver resultado');
    }

    expect(await screen.findByText('Aún no apruebas este tema')).toBeTruthy();
    await press('Volver a tomar la lección');
    expect(router.dismissTo).toHaveBeenCalledWith({
      pathname: '/tema/[topicId]',
      params: { topicId: '101' },
    });

    const course = await mockContainer.learning.getCourseProgress.execute();
    expect(course.lessons[0]).toMatchObject({ state: 'retry', attempts: 1 });
  });

  it('el examen integrador está bloqueado sin los 24 temas', async () => {
    await renderScreen(900);

    expect(await screen.findByText('Este ejercicio aún está bloqueado.')).toBeTruthy();
  });
});
