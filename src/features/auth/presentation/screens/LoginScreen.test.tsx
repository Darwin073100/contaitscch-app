import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import {
  createTestContainer,
  type TestContainerOptions,
} from '@/composition/testing/createTestContainer';

import { LoginScreen } from './LoginScreen';

type TestRemote = NonNullable<TestContainerOptions['remote']>;

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));

let mockContainer: Container;
jest.mock('@/composition/providers/AppProviders', () => ({
  useContainer: () => mockContainer,
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const USER_ID = '592e3765-89e6-405f-9e3b-0666d45e3e2b';
const TOKEN = '0a6f4c1e-2b7d-4c55-9d0e-3f1b2a6c7d8e';

/** Servidor falso: correo y contraseña de Beto; su avance en la nube trae el tema 101 aprobado. */
function cloud(): TestRemote {
  return {
    rpc: async (fn) => {
      switch (fn) {
        case 'get_login_params':
          // Pocas iteraciones: PBKDF2 real pero rápido en pruebas
          return {
            data: { salt: '0123456789abcdef0123456789abcdef', iterations: 1000 },
            error: null,
          };
        case 'login':
          return {
            data: {
              status: 'ok',
              user_id: USER_ID,
              api_token: TOKEN,
              email_verified: true,
              profile: {
                email: 'beto@correo.com',
                first_name: 'Beto',
                last_name: 'Ruiz',
                country: 'México',
                state: 'Jalisco',
                city: null,
              },
            },
            error: null,
          };
        case 'sync_progress':
          return {
            data: {
              status: 'replace',
              generation: 0,
              progress: [
                {
                  quiz_id: 101,
                  passed: true,
                  best_score: 2,
                  attempts: 1,
                  passed_at: '2026-11-10T10:00:00+00:00',
                  updated_at: '2026-11-10T10:00:00+00:00',
                },
              ],
            },
            error: null,
          };
        default:
          return { data: null, error: { message: fn } };
      }
    },
    functions: { invoke: async () => ({ data: null, error: { message: 'no' } }) },
  };
}

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LoginScreen />
    </SafeAreaProvider>,
  );

async function fillAndSubmit(email: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), email);
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LoginScreen', () => {
  it('valida el formulario antes de llamar al servidor', async () => {
    mockContainer = await createTestContainer({ session: null });
    await renderScreen();

    await fillAndSubmit('ana', '');

    expect(await screen.findByText('Escribe el correo con el que te registraste')).toBeTruthy();
    expect(screen.getByText('Escribe tu contraseña')).toBeTruthy();
  });

  it('sin red avisa que necesita conexión', async () => {
    mockContainer = await createTestContainer({ session: null });
    await renderScreen();

    await fillAndSubmit('beto@correo.com', 'secreta123');

    expect(
      await screen.findByText(/Necesitas conexión a internet para iniciar sesión/),
    ).toBeTruthy();
  });

  it('abre sesión y restaura el avance de la nube en este teléfono', async () => {
    mockContainer = await createTestContainer({
      session: null,
      remote: cloud(),
      connectivity: { isOnline: async () => true, onReconnect: () => () => {} },
    });
    await renderScreen();

    await fillAndSubmit(' Beto@Correo.com ', 'secreta123');

    await waitFor(() => expect(mockContainer.session.current()?.userId).toBe(USER_ID));
    const course = await mockContainer.learning.getCourseProgress.execute();
    expect(course.lessons[0]).toMatchObject({ topicId: 101, state: 'done' });
  });
});
