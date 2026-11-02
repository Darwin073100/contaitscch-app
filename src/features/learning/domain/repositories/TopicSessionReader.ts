import type { TopicSessionSource } from '../entities/TopicSession';

export interface TopicSessionReader {
  /** Contenido del tema con el progreso del usuario; null si el tema no existe o no tiene contenido. */
  findSession(topicId: number): Promise<TopicSessionSource | null>;
}
