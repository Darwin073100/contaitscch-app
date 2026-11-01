import type { SyllabusSource } from '../../domain/entities/Syllabus';
import type { SyllabusRepository } from '../../domain/repositories/SyllabusRepository';

// Temporal: datos de la captura docs/design/examen-pregunta.png mientras no existen las tablas
// topic/topic_progress ni el ContentSeeder. Se reemplaza por SqliteSyllabusRepository
// (ver spec/02_learning_syllabus_map_spec.md, sección 10).
const preview: SyllabusSource = {
  level: {
    id: 1,
    name: 'Básico',
    sortOrder: 1,
    title: 'Introducción a la Contabilidad',
    description: 'Domina los cimientos financieros paso a paso.',
  },
  topics: [
    {
      id: 101,
      title: 'Conceptos Básicos',
      sortOrder: 1,
      completed: true,
      viewedSubtopics: 3,
      totalSubtopics: 3,
    },
    {
      id: 102,
      title: 'Activo, Pasivo y Capital',
      sortOrder: 2,
      completed: true,
      viewedSubtopics: 3,
      totalSubtopics: 3,
    },
    {
      id: 103,
      title: 'La Partida Doble',
      sortOrder: 3,
      completed: true,
      viewedSubtopics: 4,
      totalSubtopics: 4,
    },
    {
      id: 104,
      title: 'Cuentas T (Esquemas de Mayor)',
      sortOrder: 4,
      completed: false,
      viewedSubtopics: 2,
      totalSubtopics: 3,
    },
    {
      id: 105,
      title: 'Balanza de Comprobación',
      sortOrder: 5,
      completed: false,
      viewedSubtopics: 0,
      totalSubtopics: 3,
    },
    {
      id: 106,
      title: 'Catálogo de Cuentas',
      sortOrder: 6,
      completed: false,
      viewedSubtopics: 0,
      totalSubtopics: 3,
    },
  ],
  examPassed: false,
};

export class PreviewSyllabusRepository implements SyllabusRepository {
  async findByLevel(levelId: number): Promise<SyllabusSource | null> {
    return levelId === preview.level.id ? preview : null;
  }
}
