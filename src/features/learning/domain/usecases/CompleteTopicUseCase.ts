import { err, ok, type Result } from '@/core/result/Result';

import type { TopicCompletion } from '../entities/TopicSession';
import type { TopicProgressRepository } from '../repositories/TopicProgressRepository';

export type CompleteTopicError = 'TOPIC_NOT_FOUND';

/** Marca el tema como completado (idempotente): actualiza el mapa y la barra de progreso. */
export class CompleteTopicUseCase {
  constructor(private readonly progress: TopicProgressRepository) {}

  async execute({
    topicId,
  }: {
    topicId: number;
  }): Promise<Result<TopicCompletion, CompleteTopicError>> {
    const completed = await this.progress.isCompleted(topicId);
    if (completed === null) return err('TOPIC_NOT_FOUND');
    if (completed) return ok({ topicId, firstTime: false });

    // Pendiente (spec 06): con SQLite, dentro de UnitOfWork.run(tx => …) junto con AwardXp
    // (+5 XP, synced_at NULL) y RecordDailyActivity; después publicar el evento TopicCompleted.
    await this.progress.markCompleted(topicId);
    return ok({ topicId, firstTime: true });
  }
}
