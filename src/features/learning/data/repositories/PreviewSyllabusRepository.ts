import type { SyllabusSource } from '../../domain/entities/Syllabus';
import type { SyllabusRepository } from '../../domain/repositories/SyllabusRepository';
import type { PreviewLearningStore } from '../preview/PreviewLearningStore';

// Temporal: datos de docs/design/examen-pregunta.png mientras no existen las tablas
// topic/topic_progress ni el ContentSeeder. Se reemplaza por SqliteSyllabusRepository
// (ver spec/02_learning_syllabus_map_spec.md, sección 10).
export class PreviewSyllabusRepository implements SyllabusRepository {
  constructor(private readonly store: PreviewLearningStore) {}

  async findByLevel(levelId: number): Promise<SyllabusSource | null> {
    return this.store.syllabus(levelId);
  }
}
