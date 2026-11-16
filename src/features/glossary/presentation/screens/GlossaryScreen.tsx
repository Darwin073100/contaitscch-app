import type { ReactNode } from 'react';

import { AppText, Card, Column, Screen, SearchField, SectionHeader } from '@/shared/ui';

import { useGlossaryViewModel } from '../viewmodels/useGlossaryViewModel';

type GlossaryScreenProps = {
  /** Barra superior (la arma la ruta con la sesión del usuario). */
  header: ReactNode;
};

/** Pestaña Glosario: términos contables agrupados por letra, con buscador. */
export function GlossaryScreen({ header }: GlossaryScreenProps) {
  const { query, setQuery, groups, countLabel, loading, emptyMessage } = useGlossaryViewModel();

  return (
    <Screen header={header} scroll keyboardAvoiding>
      <SectionHeader title="Glosario contable" actionLabel={countLabel} />
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar: activo, cargo, IVA…"
        accessibilityLabel="Buscar término"
      />
      {loading && <AppText variant="caption">Cargando…</AppText>}
      {emptyMessage && (
        <AppText tone="muted" align="center">
          {emptyMessage}
        </AppText>
      )}
      {groups.map((group) => (
        <Column key={group.letter} gap="sm">
          <AppText variant="overline" tone="accent" accessibilityRole="header">
            {group.letter}
          </AppText>
          {group.terms.map((t) => (
            <Card key={t.term} padding="md">
              <AppText weight="extrabold">{t.term}</AppText>
              <AppText variant="caption">{t.definition}</AppText>
            </Card>
          ))}
        </Column>
      ))}
    </Screen>
  );
}
