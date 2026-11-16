// Puerto de conectividad: el dominio pregunta si hay red sin conocer NetInfo. Vive fuera de
// core/network para que domain pueda usarlo; la implementación es core/network/NetInfoConnectivity.

export interface Connectivity {
  /** true si hay conexión a internet (o no se sabe todavía: se intenta y la llamada decide). */
  isOnline(): Promise<boolean>;
  /** Avisa al recuperar la conexión. Devuelve la función para dejar de escuchar. */
  onReconnect(listener: () => void): () => void;
}
