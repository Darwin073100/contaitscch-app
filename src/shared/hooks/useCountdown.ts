import { useCallback, useEffect, useState } from 'react';

/**
 * Cuenta regresiva en segundos ("Reenviar en 00:45"). Solo cuenta ticks de 1 s:
 * no lee la hora del sistema, así que no depende del Clock.
 */
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  /** Vuelve a empezar desde `seconds`, o desde `from` (por ejemplo, la espera que indicó el servidor). */
  const restart = useCallback((from: number = seconds) => setRemaining(from), [seconds]);

  return { remaining, done: remaining <= 0, restart };
}

/** 45 → "00:45"; 75 → "01:15". */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
}
