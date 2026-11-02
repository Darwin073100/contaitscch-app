import { TopicSchema } from '@/core/database/seed/contentSchema';

import { previewTopicContents } from './previewTopicContent';

describe('previewTopicContents', () => {
  it.each(previewTopicContents.map((t) => [t.id, t] as const))(
    'el tema %i cumple el esquema de los JSON del curso',
    (_id, topic) => {
      expect(() => TopicSchema.parse(topic)).not.toThrow();
    },
  );

  it('respeta la convención de ids: subtema = tema×100 + orden', () => {
    for (const topic of previewTopicContents) {
      for (const sub of topic.subtopics) {
        expect(sub.id).toBe(topic.id * 100 + sub.sortOrder);
      }
    }
  });
});
