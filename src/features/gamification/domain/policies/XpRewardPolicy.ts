// Puntos por actividad (reglas de negocio de CLAUDE.md). Postgres valida los mismos valores con CHECK.
export const XP_REWARD = {
  /** Tema completado por primera vez. */
  topic: 5,
  /** Examen aprobado por primera vez (score >= passing_score). */
  exam: 100,
} as const;
