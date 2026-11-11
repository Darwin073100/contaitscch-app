import type { GlossaryTerm } from '../entities/Glossary';
import { normalize, searchGlossary } from './GlossarySearch';

const terms: GlossaryTerm[] = [
  { term: 'Pasivo', definition: 'Deudas y obligaciones del negocio.' },
  { term: 'Activo', definition: 'Bienes y derechos que posee un negocio.' },
  { term: 'IVA', definition: 'Impuesto al valor agregado.' },
  { term: 'Abono', definition: 'Anotación en el Haber.' },
  { term: 'Ñandú', definition: 'Término de prueba con Ñ.' },
  { term: 'Éxito', definition: 'Término de prueba con acento.' },
];

const letters = (query: string) => searchGlossary(terms, query).map((g) => g.letter);
const found = (query: string) =>
  searchGlossary(terms, query).flatMap((g) => g.terms.map((t) => t.term));

describe('searchGlossary', () => {
  it('sin búsqueda agrupa todo por inicial en orden alfabético', () => {
    const groups = searchGlossary(terms, '  ');

    expect(groups.map((g) => g.letter)).toEqual(['A', 'E', 'I', 'N', 'P']);
    expect(groups[0].terms.map((t) => t.term)).toEqual(['Abono', 'Activo']);
  });

  it('busca en término y definición sin distinguir mayúsculas ni acentos', () => {
    expect(found('iva')).toEqual(['IVA']);
    expect(found('HABER')).toEqual(['Abono']);
    expect(found('exito')).toEqual(['Éxito']);
    expect(found('negocio')).toEqual(['Activo', 'Pasivo']);
  });

  it('agrupa bajo la letra sin acento', () => {
    expect(letters('éxito')).toEqual(['E']);
  });

  it('sin coincidencias no hay grupos', () => {
    expect(searchGlossary(terms, 'xyz')).toEqual([]);
  });
});

describe('normalize', () => {
  it('quita acentos y mayúsculas', () => {
    expect(normalize('Depósito ÁGIL')).toBe('deposito agil');
  });
});
