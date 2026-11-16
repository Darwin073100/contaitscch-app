import type { PodiumGap, Ranking } from '../entities/Ranking';

/**
 * Posiciones 1 a 3 son podio. Si no estás, los temas que te faltan para igualar al 3.er lugar
 * (en el ranking, cada nivel completado son 4 temas aprobados). null si no participas.
 */
export function podiumGap(ranking: Ranking): PodiumGap | null {
  const { me } = ranking;
  if (!me) return null;
  if (me.position <= 3) return { onPodium: true };
  const third = ranking.entries.find((e) => e.position === 3);
  return {
    onPodium: false,
    topicsToPodium: Math.max(1, (third?.topicsPassed ?? 0) - me.topicsPassed),
  };
}
