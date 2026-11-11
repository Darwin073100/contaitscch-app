// Sesión de un tema: sus subtemas como pasos ("Paso 2 de 4").

/** Un lado de la Cuenta T: etiqueta y movimientos ("+ Activo", "− Pasivo"). */
export type TAccountSide = { label: string; items: string[] };

/**
 * Bloques del contenido de un subtema. Espejo de `BlockSchema` (core/database/seed/contentSchema.ts):
 * el dominio no importa core/database; el repositorio de datos garantiza que coincidan al compilar.
 */
export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 't_account'; debit: TAccountSide; credit: TAccountSide }
  | { type: 'callout'; icon?: string; title?: string; text: string }
  | { type: 'example'; title?: string; text: string };

export type Subtopic = {
  id: number;
  title: string;
  sortOrder: number;
  blocks: ContentBlock[];
};

/** Lo que entrega el repositorio: contenido del tema + progreso guardado del usuario. */
export type TopicSessionSource = {
  level: { id: number; name: string; sortOrder: number };
  topic: { id: number; title: string; sortOrder: number };
  subtopics: Subtopic[];
  completed: boolean;
  /** Subtemas ya vistos (para retomar donde se quedó). */
  viewedSubtopics: number;
};

export type TopicSession = {
  level: TopicSessionSource['level'];
  topic: TopicSessionSource['topic'];
  /** Ordenados por sortOrder; cada uno es un paso. */
  subtopics: Subtopic[];
  completed: boolean;
  /** Índice (desde 0) del paso donde se retoma. */
  startStep: number;
};

export type TopicCompletion = {
  topicId: number;
  /** false si ya estaba completado (repaso). */
  firstTime: boolean;
};
