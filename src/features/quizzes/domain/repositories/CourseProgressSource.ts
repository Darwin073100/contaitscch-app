import type { CourseProgress } from '@/features/learning';

/** Lo único que quizzes necesita de GetCourseProgressUseCase (learning). */
export type CourseProgressSource = { execute(): Promise<CourseProgress> };
