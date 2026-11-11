import type { AppDatabase } from '@/core/database/database';
import { glossaryTerms } from '@/core/database/schema';

import type { GlossaryTerm } from '../../domain/entities/Glossary';
import type { GlossaryRepository } from '../../domain/repositories/GlossaryRepository';

export class SqliteGlossaryRepository implements GlossaryRepository {
  constructor(private readonly db: AppDatabase) {}

  async getAll(): Promise<GlossaryTerm[]> {
    // El orden alfabético español lo pone el dominio (SQLite no ordena bien acentos ni ñ)
    return this.db
      .select({ term: glossaryTerms.term, definition: glossaryTerms.definition })
      .from(glossaryTerms)
      .all();
  }
}
