import { useEffect, useState } from 'react';

import { useContainer } from '@/composition/providers/AppProviders';

import type { Glossary } from '../../domain/entities/Glossary';

/** Glosario con búsqueda en vivo (sin mayúsculas ni acentos). */
export function useGlossaryViewModel() {
  const { glossary } = useContainer();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Glossary | null>(null);

  useEffect(() => {
    let active = true;
    glossary.getGlossary.execute({ query }).then((g) => {
      if (active) setResult(g);
    });
    return () => {
      active = false;
    };
  }, [glossary, query]);

  const trimmed = query.trim();
  return {
    query,
    setQuery,
    groups: result?.groups ?? [],
    countLabel: result ? `${result.total} términos` : '',
    loading: result === null,
    emptyMessage:
      result && result.groups.length === 0
        ? `No hay términos que coincidan con “${trimmed}”. Prueba con otra palabra.`
        : null,
  };
}
