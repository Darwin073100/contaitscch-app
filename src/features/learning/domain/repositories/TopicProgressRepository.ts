export interface TopicProgressRepository {
  /** true/false según `topic_progress`; null si el tema no existe. */
  isCompleted(topicId: number): Promise<boolean | null>;
  markCompleted(topicId: number): Promise<void>;
}
