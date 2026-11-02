import type { TopicProgressRepository } from '../repositories/TopicProgressRepository';
import { CompleteTopicUseCase } from './CompleteTopicUseCase';

class InMemoryTopicProgress implements TopicProgressRepository {
  readonly marked: number[] = [];

  constructor(private readonly completed: Map<number, boolean>) {}

  async isCompleted(topicId: number) {
    return this.completed.get(topicId) ?? null;
  }

  async markCompleted(topicId: number) {
    this.completed.set(topicId, true);
    this.marked.push(topicId);
  }
}

describe('CompleteTopicUseCase', () => {
  it('marca el tema la primera vez y es idempotente después', async () => {
    const progress = new InMemoryTopicProgress(new Map([[104, false]]));
    const completeTopic = new CompleteTopicUseCase(progress);

    const first = await completeTopic.execute({ topicId: 104 });
    const second = await completeTopic.execute({ topicId: 104 });

    expect(first).toEqual({ ok: true, value: { topicId: 104, firstTime: true } });
    expect(second).toEqual({ ok: true, value: { topicId: 104, firstTime: false } });
    expect(progress.marked).toEqual([104]);
  });

  it('TOPIC_NOT_FOUND si el tema no existe', async () => {
    const result = await new CompleteTopicUseCase(new InMemoryTopicProgress(new Map())).execute({
      topicId: 999,
    });

    expect(result).toEqual({ ok: false, error: 'TOPIC_NOT_FOUND' });
  });
});
