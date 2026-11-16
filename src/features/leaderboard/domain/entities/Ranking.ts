// Ranking: más niveles completados arriba; si empatan, más temas aprobados.

export type RankingEntry = {
  /** Los empates comparten posición. */
  position: number;
  firstName: string;
  lastName: string;
  city: string | null;
  state: string;
  country: string;
  levelsCompleted: number;
  topicsPassed: number;
  isMe: boolean;
};

export type Ranking = {
  /** Participantes en el ranking (puede ser más que `entries`). */
  total: number;
  /** En orden de posición. */
  entries: RankingEntry[];
  /** "Tu posición", aunque quede fuera de `entries`; null si aún no participas (correo sin verificar). */
  me: RankingEntry | null;
};

/**
 * Lo que muestra la pantalla. `live`: recién traído de la nube. Si no, es el último guardado y
 * `notice` dice por qué: sin red, falló la sincronización o falló la consulta.
 */
export type RankingView = {
  ranking: Ranking;
  fetchedAt: string;
  live: boolean;
  notice: 'offline' | 'sync_failed' | 'network' | null;
};

/** "Estás en el podio" o cuántos temas te faltan para alcanzar el 3.er lugar. */
export type PodiumGap = { onPodium: true } | { onPodium: false; topicsToPodium: number };
