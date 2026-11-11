import { z } from 'zod';

// Esquemas del contenido del curso v3 (fuente de los tipos TS): 6 niveles × 4 temas, un ejercicio
// por tema y un examen integrador. Los ids son inmutables: Supabase guarda quiz_id en quiz_progress.
//   tema = nivel×100 + orden · pregunta = quiz×100 + orden · opción = pregunta×10 + posición
//   ejercicio de tema: quiz_id = id del tema · examen integrador: quiz_id = 900

export const FINAL_EXAM_ID = 900;
/** Postgres valida `quiz_id % 100 between 1 and 4` y el ranking cuenta 4 temas por nivel. */
export const TOPICS_PER_LEVEL = 4;
/** Postgres valida `quiz_id / 100 between 1 and 6`. */
export const MAX_LEVELS = 6;

const id = z.number().int().positive();
const sortOrder = z.number().int().positive();
const text = z.string().trim().min(1);
const fileName = z.string().regex(/^[a-z0-9-]+\.json$/);

const OptionSchema = z.object({ id, text, isCorrect: z.boolean() });

/** Solo opción múltiple: entre 2 y 4 opciones (A–D) y exactamente una correcta. */
export const QuestionSchema = z.object({
  id,
  sortOrder,
  statement: text,
  options: z
    .array(OptionSchema)
    .min(2)
    .max(4)
    .refine((o) => o.filter((x) => x.isCorrect).length === 1, {
      message: 'Debe haber exactamente una opción correcta',
    }),
  /** Se muestra solo cuando el alumno acierta. */
  feedback: text.optional(),
});

/** `passMark`: aciertos mínimos para aprobar; por omisión, todas las preguntas. */
const QuizSchema = z.object({
  passMark: z.number().int().positive().optional(),
  questions: z.array(QuestionSchema).min(1),
});

/** Cuerpo de la lección (pasos 2 a 4). Se guarda serializado en `topic.content`. */
export const LessonBodySchema = z.object({
  explanation: z.array(text).min(1),
  example: z.object({ title: text, steps: z.array(text).min(1) }),
  keyIdea: text,
  commonError: text,
  activity: text,
});

export const TopicSchema = LessonBodySchema.extend({
  id,
  sortOrder,
  title: text,
  objective: text,
  quiz: QuizSchema,
});

export const LevelFileSchema = z
  .object({
    level: z.object({
      id: id.max(MAX_LEVELS),
      /** "Fundamentos: qué es la contabilidad y para qué sirve". */
      title: text,
      /** "Al terminar este nivel el alumno…". */
      goal: text,
    }),
    topics: z.array(TopicSchema).length(TOPICS_PER_LEVEL),
  })
  .superRefine((content, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
    const levelId = content.level.id;

    checkSequence(
      `Nivel ${levelId} temas`,
      content.topics.map((t) => t.sortOrder),
      issue,
    );
    for (const topic of content.topics) {
      const expected = levelId * 100 + topic.sortOrder;
      if (topic.id !== expected) issue(`Tema ${topic.id}: el id debe ser ${expected}`);
      checkQuiz(`Tema ${topic.id}`, topic.id, topic.quiz, issue);
    }
  });

export const FinalExamSchema = QuizSchema.extend({ id: z.literal(FINAL_EXAM_ID) }).superRefine(
  (exam, ctx) => {
    checkQuiz('Examen final', exam.id, exam, (message) =>
      ctx.addIssue({ code: 'custom', message }),
    );
  },
);

export const GlossarySchema = z
  .array(z.object({ term: text, definition: text }))
  .min(1)
  .superRefine((terms, ctx) => {
    const seen = new Set<string>();
    for (const { term } of terms) {
      const key = normalizeTerm(term);
      if (seen.has(key)) ctx.addIssue({ code: 'custom', message: `Término repetido: ${term}` });
      seen.add(key);
    }
  });

export const ManifestSchema = z.object({
  version: z.number().int().positive(),
  levels: z.array(fileName).min(1),
  finalExam: fileName,
  glossary: fileName,
});

export type QuestionContent = z.infer<typeof QuestionSchema>;
export type LessonBody = z.infer<typeof LessonBodySchema>;
export type TopicContent = z.infer<typeof TopicSchema>;
export type LevelFile = z.infer<typeof LevelFileSchema>;
export type FinalExamContent = z.infer<typeof FinalExamSchema>;
export type GlossaryContent = z.infer<typeof GlossarySchema>;
export type Manifest = z.infer<typeof ManifestSchema>;

/** Valida el curso completo: niveles 1..n sin huecos ni repetidos. */
export function validateCourse(levels: readonly LevelFile[]): string[] {
  const errors: string[] = [];
  const ids = levels.map((l) => l.level.id).sort((a, b) => a - b);
  if (ids.some((levelId, i) => levelId !== i + 1)) {
    errors.push(
      `Los niveles deben ser 1..${levels.length} sin huecos ni repetidos: ${ids.join(', ')}`,
    );
  }
  return errors;
}

/** "Débito" y "debito " son el mismo término. */
export function normalizeTerm(term: string): string {
  return term.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function checkSequence(label: string, orders: number[], issue: (m: string) => void) {
  const sorted = [...orders].sort((a, b) => a - b);
  if (sorted.some((o, i) => o !== i + 1)) issue(`${label}: sortOrder debe ser 1..n sin huecos`);
}

function checkQuiz(
  label: string,
  quizId: number,
  quiz: z.infer<typeof QuizSchema>,
  issue: (m: string) => void,
) {
  if (quiz.passMark !== undefined && quiz.passMark > quiz.questions.length) {
    issue(`${label}: passMark (${quiz.passMark}) es mayor que el número de preguntas`);
  }
  checkSequence(
    `${label} preguntas`,
    quiz.questions.map((q) => q.sortOrder),
    issue,
  );
  for (const q of quiz.questions) {
    const expected = quizId * 100 + q.sortOrder;
    if (q.id !== expected) issue(`Pregunta ${q.id}: el id debe ser ${expected}`);
    q.options.forEach((o, i) => {
      const expectedOption = q.id * 10 + i + 1;
      if (o.id !== expectedOption) issue(`Opción ${o.id}: el id debe ser ${expectedOption}`);
    });
  }
}
