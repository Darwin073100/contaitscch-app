// API pública de learning: lo único que src/app y otras features pueden importar.
export type {
  CourseLesson,
  CourseLevel,
  CourseProgress,
  LessonState,
  LevelState,
} from './domain/entities/CourseProgress';
export type { ExamStatus, Syllabus, SyllabusTopic, TopicStatus } from './domain/entities/Syllabus';
export { GetCourseProgressUseCase } from './domain/usecases/GetCourseProgressUseCase';
export { GetSyllabusUseCase } from './domain/usecases/GetSyllabusUseCase';
export { SyllabusMapScreen } from './presentation/screens/SyllabusMapScreen';
export { TopicSessionScreen } from './presentation/screens/TopicSessionScreen';
