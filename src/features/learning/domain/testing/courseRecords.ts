import type { LessonRecord } from '../entities/CourseProgress';
import type { CourseProgressReader } from '../repositories/CourseProgressReader';

/**
 * Curso de prueba: `levels` niveles × 4 temas (ids nivel×100 + orden). `passed` son ids de tema
 * aprobados; `attempts`, intentos por id (por omisión 1 si está aprobado y 0 si no).
 */
export function courseRecords({
  passed = [],
  attempts = {},
  levels = 2,
}: {
  passed?: number[];
  attempts?: Record<number, number>;
  levels?: number;
} = {}): LessonRecord[] {
  return Array.from({ length: levels * 4 }, (_, i) => {
    const levelId = Math.floor(i / 4) + 1;
    const order = (i % 4) + 1;
    const topicId = levelId * 100 + order;
    const isPassed = passed.includes(topicId);
    return {
      topicId,
      levelId,
      levelOrder: levelId,
      order,
      title: `Tema ${topicId}`,
      passed: isPassed,
      attempts: attempts[topicId] ?? (isPassed ? 1 : 0),
      bestScore: isPassed ? 2 : 0,
    };
  });
}

export class InMemoryCourseProgressReader implements CourseProgressReader {
  constructor(public records: LessonRecord[]) {}

  async getLessonRecords(): Promise<LessonRecord[]> {
    return this.records;
  }
}
