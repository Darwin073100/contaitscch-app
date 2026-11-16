import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '@/composition/container';
import { createTestContainer } from '@/composition/testing/createTestContainer';

import { GlossaryScreen } from './GlossaryScreen';

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
      <GlossaryScreen header={null} />
    </SafeAreaProvider>,
  );

describe('GlossaryScreen', () => {
  beforeEach(async () => {
    mockContainer = await createTestContainer();
  });

  it('muestra los 33 términos agrupados por letra', async () => {
    await renderScreen();

    expect(await screen.findByText('33 términos')).toBeTruthy();
    expect(screen.getByText('Activo')).toBeTruthy();
    expect(screen.getByText('Bienes y derechos que posee un negocio.')).toBeTruthy();
  });

  it('busca sin distinguir mayúsculas y avisa si no hay coincidencias', async () => {
    await renderScreen();
    await screen.findByText('Activo');

    await fireEvent.changeText(screen.getByLabelText('Buscar término'), 'ACTIVO');
    expect(await screen.findByText('Activo')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Buscar término'), 'xyz');
    expect(await screen.findByText(/No hay términos que coincidan con “xyz”/)).toBeTruthy();
    expect(screen.queryByText('Activo')).toBeNull();
  });
});
