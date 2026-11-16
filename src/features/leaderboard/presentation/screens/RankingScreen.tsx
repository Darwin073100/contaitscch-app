import type { ReactNode } from 'react';

import {
  AppText,
  Button,
  Callout,
  Column,
  PodiumCard,
  RankRow,
  Screen,
  SectionHeader,
} from '@/shared/ui';

import { MyRankBar } from '../components/MyRankBar';
import { useRankingViewModel } from '../viewmodels/useRankingViewModel';

type RankingScreenProps = {
  /** Barra superior (la arma la ruta con la sesión del usuario). */
  header: ReactNode;
};

/** Pestaña Ranking: podio, participantes y "Tu posición". Sin red muestra el último guardado. */
export function RankingScreen({ header }: RankingScreenProps) {
  const { state, retry, study } = useRankingViewModel();
  const ranking = state.status === 'ready' ? state.ranking : null;

  return (
    <Screen
      header={header}
      scroll
      footer={ranking?.me && <MyRankBar {...ranking.me} onStudy={study} />}
    >
      {state.status === 'loading' && (
        <AppText variant="caption">Sincronizando tu avance y cargando el ranking…</AppText>
      )}
      {state.status === 'error' && (
        <Column gap="lg">
          <Callout tone="danger" icon="wifi-off" text={state.message} />
          <Button label="Reintentar" variant="ghost" leftIcon="refresh" onPress={retry} />
        </Column>
      )}
      {ranking && (
        <>
          {ranking.notice && (
            <Callout variant="plain" tone="amber" icon="cloud-off-outline" text={ranking.notice} />
          )}
          {ranking.podium.length > 0 && (
            <PodiumCard
              title="Podio de la carrera"
              rule="Gana quien completa más niveles; si empatan, quien aprobó más temas."
              places={ranking.podium}
            />
          )}
          <SectionHeader title="Participantes" actionLabel={ranking.countLabel} />
          <Column gap="sm" accessibilityRole="list">
            {ranking.rows.map((r) => (
              <RankRow
                key={r.key}
                position={r.position}
                initials={r.initials}
                title={r.title}
                subtitle={r.subtitle}
                stats={[
                  { value: r.levels, label: r.levels === 1 ? 'nivel' : 'niveles' },
                  { value: r.topics, label: 'temas' },
                ]}
                isMe={r.isMe}
              />
            ))}
          </Column>
        </>
      )}
    </Screen>
  );
}
