import type { Subtopic, TopicSessionSource } from '../entities/TopicSession';
import type { TopicSessionReader } from '../repositories/TopicSessionReader';
import { GetTopicSessionUseCase } from './GetTopicSessionUseCase';

class InMemoryTopicSessionReader implements TopicSessionReader {
  constructor(private readonly sources: TopicSessionSource[]) {}

  async findSession(topicId: number) {
    return this.sources.find((s) => s.topic.id === topicId) ?? null;
  }
}

const subtopic = (sortOrder: number): Subtopic => ({
  id: 10400 + sortOrder,
  title: `Subtema ${sortOrder}`,
  sortOrder,
  blocks: [{ type: 'paragraph', text: 'Texto' }],
});

const source = (overrides: Partial<TopicSessionSource> = {}): TopicSessionSource => ({
  level: { id: 1, name: 'Básico', sortOrder: 1 },
  topic: { id: 104, title: 'Cuentas T', sortOrder: 4 },
  // Desordenados a propósito: el use case los ordena
  subtopics: [subtopic(3), subtopic(1), subtopic(2)],
  completed: false,
  viewedSubtopics: 0,
  ...overrides,
});

const run = (s: TopicSessionSource[], topicId = 104) =>
  new GetTopicSessionUseCase(new InMemoryTopicSessionReader(s)).execute({ topicId });

describe('GetTopicSessionUseCase', () => {
  it('ordena los subtemas y un tema nuevo empieza en el paso 1', async () => {
    const result = await run([source()]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.subtopics.map((s) => s.sortOrder)).toEqual([1, 2, 3]);
    expect(result.value.startStep).toBe(0);
  });

  it('retoma en el primer subtema sin ver, sin pasarse del último', async () => {
    const midway = await run([source({ viewedSubtopics: 2 })]);
    const beyond = await run([source({ viewedSubtopics: 9 })]);

    expect(midway.ok && midway.value.startStep).toBe(2);
    expect(beyond.ok && beyond.value.startStep).toBe(2);
  });

  it('un tema completado es repaso: empieza en el paso 1', async () => {
    const result = await run([source({ completed: true, viewedSubtopics: 3 })]);

    expect(result.ok && result.value.startStep).toBe(0);
  });

  it('TOPIC_NOT_FOUND si no existe o no tiene subtemas', async () => {
    expect(await run([], 999)).toEqual({ ok: false, error: 'TOPIC_NOT_FOUND' });
    expect(await run([source({ subtopics: [] })])).toEqual({
      ok: false,
      error: 'TOPIC_NOT_FOUND',
    });
  });
});
