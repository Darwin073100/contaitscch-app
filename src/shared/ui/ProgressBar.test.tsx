import { render, screen } from '@testing-library/react-native';

import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('expone el porcentaje a lectores de pantalla', async () => {
    await render(<ProgressBar value={0.75} accessibilityLabel="Progreso del nivel" />);

    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 100, now: 75 });
  });

  it('recorta valores fuera de 0..1', async () => {
    await render(<ProgressBar value={1.4} accessibilityLabel="Examen" />);

    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 100 });
  });
});
