import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import {
  createTestContainer,
  type TestContainerOptions,
} from '@/composition/testing/createTestContainer';

import { RankingScreen } from './RankingScreen';

type TestRemote = NonNullable<TestContainerOptions['remote']>;

jest.mock('expo-router', () => ({
  router: { navigate: jest.fn() },
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

const entry = (position: number, first: string, topics: number, isMe = false) => ({
  position,
  first_name: first,
  last_name: 'Méndez Ruiz',
  city: null,
  state: 'Michoacán',
  country: 'México',
  levels_completed: Math.floor(topics / 4),
  topics_passed: topics,
  is_me: isMe,
});

const entries = [
  entry(1, 'Carlos', 19),
  entry(2, 'Andrea', 17),
  entry(3, 'Miguel', 13),
  entry(4, 'Ana', 9, true),
];

const cloud: TestRemote = {
  rpc: async (fn) =>
    fn === 'sync_progress'
      ? {
          data: { status: 'ok', generation: 0, synced_at: '2026-11-15T12:00:00Z', progress: [] },
          error: null,
        }
      : fn === 'get_ranking'
        ? { data: { status: 'ok', total: 4, entries, me: entries[3] }, error: null }
        : { data: null, error: { message: fn } },
  functions: { invoke: async () => ({ data: null, error: { message: 'no' } }) },
};

const online = { isOnline: async () => true, onReconnect: () => () => {} };

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <RankingScreen header={null} />
    </SafeAreaProvider>,
  );

describe('RankingScreen', () => {
  it('podio, participantes y "Tu posición"', async () => {
    mockContainer = await createTestContainer({ remote: cloud, connectivity: online });
    await renderScreen();

    expect(await screen.findByText('Podio de la carrera')).toBeTruthy();
    expect(screen.getByText('4 estudiantes')).toBeTruthy();
    expect(screen.getByText('Tú · Ana Méndez')).toBeTruthy();
    expect(screen.getByText('#4')).toBeTruthy();
    expect(screen.getByText('4 temas para el podio')).toBeTruthy();
  });

  it('sin red y sin ranking guardado explica que necesita conexión', async () => {
    mockContainer = await createTestContainer();
    await renderScreen();

    expect(
      await screen.findByText(/Necesitas conexión a internet para ver el ranking/),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  });
});
