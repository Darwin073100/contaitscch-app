import { LessonBodySchema } from '@/core/database/seed/courseSchema';

import type { Subtopic } from '../../domain/entities/TopicSession';

/** Los 4 pasos fijos de cada tema, en orden. */
export const LESSON_STEP_TITLES = [
  'Objetivo',
  'Explicación',
  'Ejemplo resuelto',
  'Repaso del tema',
] as const;

/**
 * Columnas `objective` + `content` (JSON) de un tema → sus 4 pasos como bloques que ya sabe pintar
 * el SubtopicRenderer. El JSON se valida otra vez por si la fila no vino del ContentSeeder.
 * Temporal (refactorización v2): en F4 la lección pasa a ser una entidad propia.
 */
export function toLessonSteps(topicId: number, objective: string, content: string): Subtopic[] {
  const body = LessonBodySchema.parse(JSON.parse(content));
  const blocks: Subtopic['blocks'][] = [
    [{ type: 'paragraph', text: objective }],
    body.explanation.map((text) => ({ type: 'paragraph' as const, text })),
    [
      {
        type: 'example',
        title: body.example.title,
        text: body.example.steps.map((step, i) => `${i + 1}. ${step}`).join('\n'),
      },
    ],
    [
      { type: 'callout', icon: 'lightbulb', title: 'Idea clave', text: body.keyIdea },
      { type: 'callout', icon: 'warning', title: 'Error común', text: body.commonError },
      { type: 'callout', icon: 'book', title: 'Actividad para practicar', text: body.activity },
    ],
  ];
  return LESSON_STEP_TITLES.map((title, i) => ({
    id: topicId * 10 + i + 1,
    title,
    sortOrder: i + 1,
    blocks: blocks[i],
  }));
}
