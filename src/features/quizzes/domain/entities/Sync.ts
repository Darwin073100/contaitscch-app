// Sincronización del avance con la nube y el estado que pinta el indicador.

/** Por qué falló la última sincronización. */
export type SyncErrorCode = 'offline' | 'network' | 'invalid_input' | 'invalid_token';

/** Lo que el teléfono recuerda de la última sincronización (una fila por usuario). */
export type SyncState = {
  /** Generación del avance en la nube; null si este teléfono nunca ha sincronizado. */
  generation: number | null;
  lastSyncedAt: string | null;
  /** null si la última sincronización salió bien. */
  lastError: SyncErrorCode | null;
};

/**
 * Estado del indicador: `synced` todo arriba · `pending` hay cambios sin subir · `offline` sin red
 * · `error` falló la última vez · `never` nunca ha sincronizado y no hay nada pendiente.
 */
export type SyncStatus = {
  status: 'synced' | 'pending' | 'offline' | 'error' | 'never';
  pendingCount: number;
  lastSyncedAt: string | null;
};

/** `merged`: se subió y fusionó · `replaced`: el avance local se reemplazó por el de la nube. */
export type SyncOutcome = { kind: 'merged' | 'replaced'; pushed: number };

export type SyncError = 'OFFLINE' | 'NETWORK' | 'INVALID_INPUT' | 'INVALID_TOKEN';
