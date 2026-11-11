import { createSeededTestDatabase } from '@/core/database/testing/createSeededTestDatabase';

import { SqliteGlossaryRepository } from './SqliteGlossaryRepository';

describe('SqliteGlossaryRepository', () => {
  it('devuelve los términos sembrados', async () => {
    const repo = new SqliteGlossaryRepository(await createSeededTestDatabase());

    const terms = await repo.getAll();

    expect(terms).toHaveLength(33);
    expect(terms).toContainEqual({
      term: 'Activo',
      definition: 'Bienes y derechos que posee un negocio.',
    });
  });
});
