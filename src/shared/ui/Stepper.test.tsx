import { render, screen } from '@testing-library/react-native';

import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('anuncia el paso actual', async () => {
    await render(<Stepper steps={['Tus Datos', 'Verificación']} current={1} />);

    expect(screen.getByLabelText('Paso 2 de 2: Verificación')).toBeTruthy();
    expect(screen.getByText('✓')).toBeTruthy();
  });
});
