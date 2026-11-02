import type { TopicSessionSource } from '../../domain/entities/TopicSession';
import type { TopicProgressRepository } from '../../domain/repositories/TopicProgressRepository';
import type { TopicSessionReader } from '../../domain/repositories/TopicSessionReader';
import type { PreviewLearningStore } from '../preview/PreviewLearningStore';

// Temporal: se reemplaza por SqliteTopicRepository (subtopic + topic_progress), spec 06 §9.
export class PreviewTopicRepository implements TopicSessionReader, TopicProgressRepository {
  constructor(private readonly store: PreviewLearningStore) {}

  async findSession(topicId: number): Promise<TopicSessionSource | null> {
    return this.store.session(topicId);
  }

  async isCompleted(topicId: number): Promise<boolean | null> {
    return this.store.isCompleted(topicId);
  }

  async markCompleted(topicId: number): Promise<void> {
    this.store.markCompleted(topicId);
  }
}
