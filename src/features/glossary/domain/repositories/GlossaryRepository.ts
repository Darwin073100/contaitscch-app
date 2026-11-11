import type { GlossaryTerm } from '../entities/Glossary';

export interface GlossaryRepository {
  getAll(): Promise<GlossaryTerm[]>;
}
