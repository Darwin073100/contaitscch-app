import type { SyllabusLevel, SyllabusSource, TopicProgress } from '../../domain/entities/Syllabus';
import type { TopicSessionSource } from '../../domain/entities/TopicSession';
import { previewTopicContents } from './previewTopicContent';

// Temporal: progreso en memoria compartido por los repositorios de ejemplo, para que completar un
// tema en la sesión se vea en el mapa al regresar. Se reinicia al recargar la app.
// Se reemplaza por SQLite (topic, subtopic, topic_progress): spec 02 §10 y spec 06 §9.

const level: SyllabusLevel = {
  id: 1,
  name: 'Básico',
  sortOrder: 1,
  title: 'Introducción a la Contabilidad',
  description: 'Domina los cimientos financieros paso a paso.',
};

const initialTopics: TopicProgress[] = [
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
  // Visto 1 de 4: la sesión se retoma en el paso 2, el de la captura
  {
    id: 104,
    title: 'Cuentas T (Esquemas de Mayor)',
    sortOrder: 4,
    completed: false,
    viewedSubtopics: 1,
    totalSubtopics: 4,
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
];

export class PreviewLearningStore {
  // Copia por instancia: cada contenedor (y cada prueba) empieza con el mismo progreso.
  private readonly topics = initialTopics.map((t) => ({ ...t }));
  private readonly examPassed = false;

  syllabus(levelId: number): SyllabusSource | null {
    if (levelId !== level.id) return null;
    return { level, topics: this.topics.map((t) => ({ ...t })), examPassed: this.examPassed };
  }

  session(topicId: number): TopicSessionSource | null {
    const progress = this.topics.find((t) => t.id === topicId);
    const content = previewTopicContents.find((t) => t.id === topicId);
    if (!progress || !content) return null;
    return {
      level: { id: level.id, name: level.name, sortOrder: level.sortOrder },
      topic: { id: content.id, title: content.title, sortOrder: content.sortOrder },
      // Block (Zod) → ContentBlock (dominio): si los tipos se separan, esto deja de compilar.
      subtopics: content.subtopics,
      completed: progress.completed,
      viewedSubtopics: progress.viewedSubtopics,
    };
  }

  isCompleted(topicId: number): boolean | null {
    return this.topics.find((t) => t.id === topicId)?.completed ?? null;
  }

  markCompleted(topicId: number): void {
    const topic = this.topics.find((t) => t.id === topicId);
    if (!topic) return;
    topic.completed = true;
    topic.viewedSubtopics = topic.totalSubtopics;
  }
}
