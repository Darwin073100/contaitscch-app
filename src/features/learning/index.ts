// API pública de learning: lo único que src/app y otras features pueden importar.
export type {
  CourseLesson,
  CourseLevel,
  CourseProgress,
  LessonState,
  LevelState,
} from './domain/entities/CourseProgress';
export type { Lesson } from './domain/entities/Lesson';
export type { ExamStatus, Syllabus, SyllabusTopic, TopicStatus } from './domain/entities/Syllabus';
export { GetCourseProgressUseCase } from './domain/usecases/GetCourseProgressUseCase';
export { GetLessonUseCase } from './domain/usecases/GetLessonUseCase';
export { GetSyllabusUseCase } from './domain/usecases/GetSyllabusUseCase';
export { LessonScreen } from './presentation/screens/LessonScreen';
export { SyllabusMapScreen } from './presentation/screens/SyllabusMapScreen';
