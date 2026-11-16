// Lección de un tema: 4 pasos fijos (objetivo + infografía → explicación → ejemplo → repaso) y
// al final su ejercicio.

/** Cuerpo de la lección. Espejo de `LessonBodySchema` (core/database/seed/courseSchema.ts). */
export type LessonBody = {
  /** Párrafos del paso 2. */
  explanation: string[];
  /** Caso práctico del paso 3. */
  example: { title: string; steps: string[] };
  keyIdea: string;
  commonError: string;
  activity: string;
};

/** Lo que entrega el repositorio: el contenido del tema y los datos de su ejercicio. */
export type LessonSource = {
  level: { id: number; order: number };
  topic: { id: number; title: string; order: number };
  objective: string;
  body: LessonBody;
  quiz: { questionCount: number; passMark: number };
};

export type Lesson = LessonSource & {
  /** Ya lo aprobó (repaso). */
  passed: boolean;
  /** Lo intentó sin aprobar: se está retomando la lección. */
  retake: boolean;
};
