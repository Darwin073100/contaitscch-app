import type { GlossaryGroup, GlossaryTerm } from '../entities/Glossary';

/** Sin mayúsculas ni acentos: "IVA" encuentra "iva" y "deposito" encuentra "Depósito". */
export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Filtra por término o definición y agrupa por inicial en orden alfabético español.
 * Una búsqueda vacía devuelve todo el glosario.
 */
export function searchGlossary(terms: readonly GlossaryTerm[], query: string): GlossaryGroup[] {
  const needle = normalize(query.trim());
  const found = terms
    .filter((t) => !needle || normalize(`${t.term} ${t.definition}`).includes(needle))
    .sort((a, b) => a.term.localeCompare(b.term, 'es'));

  const groups: GlossaryGroup[] = [];
  for (const term of found) {
    const letter = normalize(term.term.trim().charAt(0)).toUpperCase();
    const last = groups.at(-1);
    if (last?.letter === letter) last.terms.push(term);
    else groups.push({ letter, terms: [term] });
  }
  return groups;
}
