import { keepOrder, RandomShuffler } from './Shuffler';

/** Secuencia fija de números "aleatorios" para que la prueba sea repetible. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('RandomShuffler', () => {
  it('devuelve los mismos elementos en otro orden sin tocar la lista original', () => {
    const items = ['A', 'B', 'C', 'D'];

    const shuffled = new RandomShuffler(sequence(0, 0, 0)).shuffle(items);

    expect(shuffled).toEqual(['B', 'C', 'D', 'A']);
    expect(items).toEqual(['A', 'B', 'C', 'D']);
  });

  it('con números cercanos a 1 conserva el orden (ningún intercambio)', () => {
    expect(new RandomShuffler(() => 0.999).shuffle([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('con Math.random reparte la primera posición entre todas las opciones', () => {
    const shuffler = new RandomShuffler();
    const firsts = new Set<string>();
    for (let i = 0; i < 200; i++) firsts.add(shuffler.shuffle(['A', 'B', 'C', 'D'])[0]);

    expect([...firsts].sort()).toEqual(['A', 'B', 'C', 'D']);
  });
});

describe('keepOrder', () => {
  it('copia la lista en el mismo orden', () => {
    const items = [1, 2, 3];
    const copy = keepOrder.shuffle(items);

    expect(copy).toEqual([1, 2, 3]);
    expect(copy).not.toBe(items);
  });
});
