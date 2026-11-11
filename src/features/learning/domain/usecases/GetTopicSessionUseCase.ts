import { err, ok, type Result } from '@/core/result/Result';

import type { TopicSession } from '../entities/TopicSession';
import type { TopicSessionReader } from '../repositories/TopicSessionReader';

export type GetTopicSessionError = 'TOPIC_NOT_FOUND';

/** Pasos (subtemas) de un tema y el paso donde retomar. */
export class GetTopicSessionUseCase {
  constructor(private readonly topics: TopicSessionReader) {}

  async execute({
    topicId,
  }: {
    topicId: number;
  }): Promise<Result<TopicSession, GetTopicSessionError>> {
    const source = await this.topics.findSession(topicId);
    if (!source || source.subtopics.length === 0) return err('TOPIC_NOT_FOUND');

    const subtopics = [...source.subtopics].sort((a, b) => a.sortOrder - b.sortOrder);
    // Repaso desde el inicio; si no, el primer subtema sin ver (sin pasarse del último).
    const startStep = source.completed
      ? 0
      : Math.min(Math.max(source.viewedSubtopics, 0), subtopics.length - 1);

    return ok({
      level: source.level,
      topic: source.topic,
      subtopics,
      completed: source.completed,
      startStep,
    });
  }
}
