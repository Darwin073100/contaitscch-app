import { act, screen } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';

import type { Session } from '@/core/session/SessionStore';

import type { Container } from './container';
import { RootNavigator } from './RootNavigator';
import { createTestContainer } from './testing/createTestContainer';

let mockContainer: Container;
jest.mock('./providers/AppProviders', () => ({
  useContainer: () => mockContainer,
}));

const pending: Session = {
  userId: 'id-1',
  apiToken: 't',
  email: 'ana@correo.com',
  emailVerified: false,
};

/** Rutas falsas con los mismos nombres que src/app: cada una solo pinta su nombre. */
const page = (name: string) =>
  function Page() {
    return <Text>{name}</Text>;
  };

const routes = {
  _layout: RootNavigator,
  '(tabs)/_layout': Slot,
  '(tabs)/index': page('Aprender'),
  'tema/[topicId]': page('Tema'),
  '(auth)/registro': page('Registro'),
  '(auth)/verificar-correo': page('Verificación'),
  'acerca-de': page('Acerca de'),
};

async function open(session: Session | null, initialUrl = '/') {
  mockContainer = await createTestContainer({ session });
  return renderRouter(routes, { initialUrl });
}

describe('RootNavigator (guard de sesión)', () => {
  it('sin sesión: abre el registro aunque se pida el curso', async () => {
    await open(null);

    expect(screen.getByText('Registro')).toBeTruthy();
    expect(screen).toHavePathname('/registro');
  });

  it('sesión sin verificar: abre la verificación', async () => {
    await open(pending);

    expect(screen.getByText('Verificación')).toBeTruthy();
  });

  it('sesión verificada: abre el curso y no deja volver al registro', async () => {
    await open({ ...pending, emailVerified: true }, '/registro');

    expect(screen.getByText('Aprender')).toBeTruthy();
  });

  it('al verificar el correo cambia solo a las pestañas', async () => {
    await open(pending);
    expect(screen.getByText('Verificación')).toBeTruthy();

    await act(() => mockContainer.session.markEmailVerified());

    expect(await screen.findByText('Aprender')).toBeTruthy();
  });

  it('al cerrar sesión regresa al registro', async () => {
    await open({ ...pending, emailVerified: true });
    expect(screen.getByText('Aprender')).toBeTruthy();

    await act(() => mockContainer.auth.logout.execute());

    expect(await screen.findByText('Registro')).toBeTruthy();
  });

  it('"Acerca de" se puede abrir sin sesión', async () => {
    await open(null, '/acerca-de');

    expect(screen.getByText('Acerca de')).toBeTruthy();
  });
});
