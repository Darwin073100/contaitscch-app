import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';

import { ProfileScreen } from './ProfileScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), navigate: jest.fn() },
  useFocusEffect: (effect: () => void | (() => void)) =>
    jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
}));

// Contenedor real sin red: el avance aprobado (101, 102) queda pendiente de sincronizar
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
      <ProfileScreen header={null} />
    </SafeAreaProvider>,
  );

const press = (name: string) => fireEvent.press(screen.getByRole('button', { name }));

describe('ProfileScreen', () => {
  beforeEach(async () => {
    mockContainer = await createTestContainer({ completedTopics: [101, 102] });
  });

  it('datos del alumno, avance por nivel y estado de sincronización', async () => {
    await renderScreen();

    expect(await screen.findByText('Ana López')).toBeTruthy();
    expect(screen.getByText('Nivel 1 · 2 de 24 temas aprobados')).toBeTruthy();
    expect(screen.getByText('Sin conexión')).toBeTruthy();
    expect(screen.getByText('2 cambios se guardan en el teléfono hasta tener red')).toBeTruthy();
    expect(
      screen.getByText('Examen integrador: se desbloquea al aprobar los 24 temas.'),
    ).toBeTruthy();
  });

  it('reiniciar sin red no borra nada y explica por qué', async () => {
    await renderScreen();
    await screen.findByText('Ana López');

    await press('Reiniciar mi avance');
    expect(screen.getByText('¿Borrar todo tu avance?')).toBeTruthy();
    await press('Borrar avance');

    expect(await screen.findByText(/Necesitas conexión para reiniciar tu avance/)).toBeTruthy();
    const course = await mockContainer.learning.getCourseProgress.execute();
    expect(course.passedCount).toBe(2);
  });

  it('cerrar sesión con cambios pendientes pide confirmación', async () => {
    await renderScreen();
    await screen.findByText('Ana López');

    await press('Cerrar sesión');
    expect(screen.getByText('Tienes 2 cambios sin sincronizar')).toBeTruthy();
    expect(mockContainer.session.current()).not.toBeNull();

    // El botón de la confirmación (el del menú queda arriba en la lista)
    const buttons = screen.getAllByRole('button', { name: 'Cerrar sesión' });
    await fireEvent.press(buttons[0]);

    await waitFor(() => expect(mockContainer.session.current()).toBeNull());
  });
});
