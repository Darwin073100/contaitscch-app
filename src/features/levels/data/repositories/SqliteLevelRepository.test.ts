import { createSeededTestDatabase } from '@/core/database/testing/createSeededTestDatabase';

import { SqliteLevelRepository } from './SqliteLevelRepository';

describe('SqliteLevelRepository', () => {
  it('devuelve los 6 niveles en orden con sus textos', async () => {
    const repo = new SqliteLevelRepository(await createSeededTestDatabase());

    const levels = await repo.getLevels();

    expect(levels.map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(levels[0]).toEqual({
      id: 1,
      sortOrder: 1,
      title: 'Fundamentos: qué es la contabilidad y para qué sirve',
      description: expect.stringContaining('Al terminar este nivel'),
    });
  });
});
