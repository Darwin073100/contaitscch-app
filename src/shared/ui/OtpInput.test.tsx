import { fireEvent, render, screen } from '@testing-library/react-native';

import { OtpInput } from './OtpInput';

describe('OtpInput', () => {
  it('pinta un dígito por casilla', async () => {
    await render(<OtpInput value="724" onChange={jest.fn()} />);

    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('solo acepta dígitos y respeta la longitud', async () => {
    const onChange = jest.fn();
    await render(<OtpInput value="" onChange={onChange} length={6} />);

    await fireEvent.changeText(screen.getByLabelText('Código de verificación'), '7a2-4 99123');

    expect(onChange).toHaveBeenCalledWith('724991');
  });
});
