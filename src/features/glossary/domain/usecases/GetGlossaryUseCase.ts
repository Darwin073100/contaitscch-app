import type { Glossary } from '../entities/Glossary';
import { searchGlossary } from '../policies/GlossarySearch';
import type { GlossaryRepository } from '../repositories/GlossaryRepository';

/** Glosario agrupado por letra, filtrado por la búsqueda (vacía = todo). */
export class GetGlossaryUseCase {
  constructor(private readonly glossary: GlossaryRepository) {}

  async execute({ query = '' }: { query?: string } = {}): Promise<Glossary> {
    const terms = await this.glossary.getAll();
    return { total: terms.length, groups: searchGlossary(terms, query) };
  }
}
