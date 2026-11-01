import { act, renderHook } from '@testing-library/react-native';

import { formatCountdown, useCountdown } from './useCountdown';

describe('formatCountdown', () => {
  it('formatea minutos y segundos con dos dígitos', () => {
    expect(formatCountdown(45)).toBe('00:45');
    expect(formatCountdown(75)).toBe('01:15');
    expect(formatCountdown(-3)).toBe('00:00');
  });
});

describe('useCountdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('baja un segundo por tick, termina en 0 y se puede reiniciar', async () => {
    const { result } = await renderHook(() => useCountdown(2));
    expect(result.current.remaining).toBe(2);

    await act(() => jest.advanceTimersByTime(1000));
    expect(result.current.remaining).toBe(1);

    await act(() => jest.advanceTimersByTime(1000));
    expect(result.current.done).toBe(true);

    await act(() => result.current.restart());
    expect(result.current.remaining).toBe(2);
  });
});
