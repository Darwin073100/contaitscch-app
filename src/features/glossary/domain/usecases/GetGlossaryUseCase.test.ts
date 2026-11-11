import type { GlossaryTerm } from '../entities/Glossary';
import type { GlossaryRepository } from '../repositories/GlossaryRepository';
import { GetGlossaryUseCase } from './GetGlossaryUseCase';

class InMemoryGlossaryRepository implements GlossaryRepository {
  constructor(private readonly terms: GlossaryTerm[]) {}

  async getAll() {
    return this.terms;
  }
}

const repo = new InMemoryGlossaryRepository([
  { term: 'Activo', definition: 'Bienes y derechos.' },
  { term: 'Cargo', definition: 'Anotación en el Debe.' },
]);

describe('GetGlossaryUseCase', () => {
  it('devuelve el total del glosario y los grupos que coinciden', async () => {
    const glossary = await new GetGlossaryUseCase(repo).execute({ query: 'debe' });

    expect(glossary).toEqual({
      total: 2,
      groups: [{ letter: 'C', terms: [{ term: 'Cargo', definition: 'Anotación en el Debe.' }] }],
    });
  });

  it('sin búsqueda devuelve todo', async () => {
    const glossary = await new GetGlossaryUseCase(repo).execute();

    expect(glossary.groups.map((g) => g.letter)).toEqual(['A', 'C']);
  });
});
