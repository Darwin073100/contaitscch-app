/**
 * Desordena listas (puerto que usa el dominio, como Clock). En la app es aleatorio; en las pruebas se
 * inyecta `keepOrder` para que el resultado sea predecible.
 */
export interface Shuffler {
  /** Copia de `items` en otro orden; no modifica la lista original. */
  shuffle<T>(items: readonly T[]): T[];
}

/** Fisher–Yates: todas las permutaciones son igual de probables. */
export class RandomShuffler implements Shuffler {
  /** `random` devuelve un número en [0, 1); por omisión, Math.random. */
  constructor(private readonly random: () => number = Math.random) {}

  shuffle<T>(items: readonly T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/** Conserva el orden original (pruebas). */
export const keepOrder: Shuffler = {
  shuffle: (items) => [...items],
};
