import { z } from 'zod';

// Esquemas del contenido del curso (fuente de los tipos TS). Ver docs/ARCHITECTURE.md
// "Contenido del curso en JSON". Los ids son inmutables: Supabase guarda topic_id y exam_id.

const id = z.number().int().positive();
const sortOrder = z.number().int().positive();
const text = z.string().trim().min(1);

const TAccountSideSchema = z.object({ label: text, items: z.array(text).min(1) });

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text }),
  z.object({ type: z.literal('t_account'), debit: TAccountSideSchema, credit: TAccountSideSchema }),
  z.object({ type: z.literal('callout'), icon: text.optional(), title: text.optional(), text }),
  z.object({ type: z.literal('example'), title: text.optional(), text }),
]);

export const SubtopicSchema = z.object({
  id,
  title: text,
  sortOrder,
  blocks: z.array(BlockSchema).min(1),
});

export const TopicSchema = z.object({
  id,
  title: text,
  sortOrder,
  subtopics: z.array(SubtopicSchema).min(1),
});

const OptionSchema = z.object({ id, text, isCorrect: z.boolean() });

export const QuestionSchema = z.discriminatedUnion('type', [
  z.object({
    id,
    type: z.literal('multiple_choice'),
    sortOrder,
    statement: text,
    options: z
      .array(OptionSchema)
      .min(2)
      .refine((o) => o.filter((x) => x.isCorrect).length === 1, {
        message: 'Opción múltiple: debe haber exactamente una opción correcta',
      }),
    feedback: text.optional(),
  }),
  z.object({
    id,
    type: z.literal('complementary'),
    sortOrder,
    statement: text,
    options: z
      .array(OptionSchema)
      .min(1)
      .refine((o) => o.every((x) => x.isCorrect), {
        message: 'Complementaria: todas las opciones son respuestas aceptadas (isCorrect: true)',
      }),
    feedback: text.optional(),
  }),
]);

export const ExamSchema = z.object({
  id,
  xpReward: z.literal(100),
  passingScore: z.number().int().min(1).max(100),
  questions: z.array(QuestionSchema).min(1),
});

export const LevelContentSchema = z
  .object({
    level: z.object({ id, name: text, sortOrder }),
    topics: z.array(TopicSchema).min(1),
    exam: ExamSchema,
  })
  .superRefine((content, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    const levelId = content.level.id;

    const checkSequence = (label: string, orders: number[]) => {
      const sorted = [...orders].sort((a, b) => a - b);
      if (sorted.some((o, i) => o !== i + 1)) issue(`${label}: sortOrder debe ser 1..n sin huecos`);
    };

    // Ids: tema = nivel×100 + orden; subtema = tema×100 + orden; pregunta = examen×1000 + orden
    checkSequence(
      `Nivel ${levelId} temas`,
      content.topics.map((t) => t.sortOrder),
    );
    for (const topic of content.topics) {
      if (topic.id !== levelId * 100 + topic.sortOrder) {
        issue(`Tema ${topic.id}: el id debe ser ${levelId * 100 + topic.sortOrder}`);
      }
      checkSequence(
        `Tema ${topic.id} subtemas`,
        topic.subtopics.map((s) => s.sortOrder),
      );
      for (const sub of topic.subtopics) {
        if (sub.id !== topic.id * 100 + sub.sortOrder) {
          issue(`Subtema ${sub.id}: el id debe ser ${topic.id * 100 + sub.sortOrder}`);
        }
      }
    }

    const exam = content.exam;
    if (exam.id !== levelId)
      issue(`Examen ${exam.id}: el id debe ser igual al del nivel (${levelId})`);
    checkSequence(
      `Examen ${exam.id} preguntas`,
      exam.questions.map((q) => q.sortOrder),
    );
    for (const q of exam.questions) {
      if (q.id !== exam.id * 1000 + q.sortOrder) {
        issue(`Pregunta ${q.id}: el id debe ser ${exam.id * 1000 + q.sortOrder}`);
      }
      const optionIds = new Set(q.options.map((o) => o.id));
      if (optionIds.size !== q.options.length) issue(`Pregunta ${q.id}: ids de opción repetidos`);
    }
  });

export const ManifestSchema = z.object({
  version: z.number().int().positive(),
  levels: z.array(z.string().regex(/^[a-z0-9-]+\.json$/)),
});

export type Block = z.infer<typeof BlockSchema>;
export type LevelContent = z.infer<typeof LevelContentSchema>;
export type Manifest = z.infer<typeof ManifestSchema>;

/** Valida el curso completo: cada nivel y la unicidad global de ids y órdenes. */
export function validateCourse(levels: LevelContent[]): string[] {
  const errors: string[] = [];
  const seen = new Map<string, Set<number>>();
  const unique = (kind: string, value: number) => {
    const set = seen.get(kind) ?? new Set<number>();
    if (set.has(value)) errors.push(`${kind} ${value} repetido entre niveles`);
    set.add(value);
    seen.set(kind, set);
  };
  for (const l of levels) {
    unique('Nivel', l.level.id);
    unique('sortOrder de nivel', l.level.sortOrder);
    unique('Examen', l.exam.id);
    l.exam.questions.forEach((q) => q.options.forEach((o) => unique('Opción', o.id)));
  }
  return errors;
}
