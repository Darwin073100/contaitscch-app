import type { ExamStatus, SyllabusTopic, TopicProgress } from '../entities/Syllabus';

/** Un tema está bloqueado si el anterior (sort_order - 1) no está completado; el primero siempre está abierto. */
export function resolveTopicStatuses(topics: readonly TopicProgress[]): SyllabusTopic[] {
  const sorted = [...topics].sort((a, b) => a.sortOrder - b.sortOrder);
  const completedOrders = new Set(sorted.filter((t) => t.completed).map((t) => t.sortOrder));

  return sorted.map((topic): SyllabusTopic => {
    if (topic.completed) return { ...topic, status: 'completed' };
    const unlocked = topic.sortOrder === 1 || completedOrders.has(topic.sortOrder - 1);
    return { ...topic, status: unlocked ? 'active' : 'locked' };
  });
}

/** El examen del nivel se presenta cuando todos sus temas están completados. */
export function resolveExamStatus(
  topics: readonly TopicProgress[],
  examPassed: boolean,
): ExamStatus {
  if (examPassed) return 'passed';
  return topics.length > 0 && topics.every((t) => t.completed) ? 'available' : 'locked';
}
