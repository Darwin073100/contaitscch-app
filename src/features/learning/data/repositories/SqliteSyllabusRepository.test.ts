import { createSeededTestDatabase } from '@/core/database/testing/createSeededTestDatabase';

import { SqliteSyllabusRepository } from './SqliteSyllabusRepository';

describe('SqliteSyllabusRepository', () => {
  it('devuelve los textos del nivel', async () => {
    const repo = new SqliteSyllabusRepository(await createSeededTestDatabase());

    expect(await repo.findLevel(1)).toEqual({
      id: 1,
      sortOrder: 1,
      title: 'Fundamentos: qué es la contabilidad y para qué sirve',
      description: expect.stringContaining('Al terminar este nivel'),
    });
  });

  it('devuelve null si el nivel no existe', async () => {
    const repo = new SqliteSyllabusRepository(await createSeededTestDatabase());

    expect(await repo.findLevel(9)).toBeNull();
  });
});
