import { err, ok, type Result } from '@/core/result/Result';

import type { Syllabus } from '../entities/Syllabus';
import { resolveExamStatus, resolveTopicStatuses } from '../policies/TopicLockPolicy';
import type { SyllabusRepository } from '../repositories/SyllabusRepository';

export type GetSyllabusError = 'LEVEL_NOT_FOUND';

/** Temario de un nivel con el estado de cada tema y del examen (mapa de la pestaña Aprender). */
export class GetSyllabusUseCase {
  constructor(private readonly syllabi: SyllabusRepository) {}

  async execute({ levelId }: { levelId: number }): Promise<Result<Syllabus, GetSyllabusError>> {
    const source = await this.syllabi.findByLevel(levelId);
    if (!source) return err('LEVEL_NOT_FOUND');

    const topics = resolveTopicStatuses(source.topics);
    return ok({
      level: source.level,
      topics,
      completedTopics: topics.filter((t) => t.status === 'completed').length,
      totalTopics: topics.length,
      activeTopic: topics.find((t) => t.status === 'active') ?? null,
      examStatus: resolveExamStatus(source.topics, source.examPassed),
    });
  }
}
