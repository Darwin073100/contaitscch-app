// Glosario contable: términos con su definición, agrupados por letra.

export type GlossaryTerm = { term: string; definition: string };

export type GlossaryGroup = {
  /** Inicial sin acento: "A", "B"… */
  letter: string;
  terms: GlossaryTerm[];
};

export type Glossary = {
  /** Términos del glosario completo (no solo los encontrados). */
  total: number;
  /** Solo las letras con términos que coinciden con la búsqueda. */
  groups: GlossaryGroup[];
};
