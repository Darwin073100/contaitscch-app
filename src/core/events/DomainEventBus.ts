// Observer: una feature avisa que algo pasó y las demás reaccionan sin conocerse
// (refrescar Niveles y Aprender, disparar la sincronización…).

export type DomainEvent =
  /** Cambió el avance de un ejercicio (tema) o del examen final. */
  | { type: 'ProgressChanged'; quizId: number }
  /** Se aprobaron por primera vez los 4 temas de un nivel. */
  | { type: 'LevelCompleted'; levelId: number }
  /** Se aprobó por primera vez el examen integrador. */
  | { type: 'FinalExamPassed' };

export type DomainEventListener = (event: DomainEvent) => void;

export interface DomainEventBus {
  publish(event: DomainEvent): void;
  /** Devuelve la función para dejar de escuchar. */
  subscribe(listener: DomainEventListener): () => void;
}

export class InMemoryDomainEventBus implements DomainEventBus {
  private readonly listeners = new Set<DomainEventListener>();

  publish(event: DomainEvent): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(event);
      } catch (error) {
        // Un oyente que falla no impide que los demás reciban el evento
        console.error('Error en un oyente de eventos de dominio', error);
      }
    }
  }

  subscribe(listener: DomainEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
