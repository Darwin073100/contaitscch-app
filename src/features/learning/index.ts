// API pública de learning: lo único que src/app y otras features pueden importar.
export type { ExamStatus, Syllabus, SyllabusTopic, TopicStatus } from './domain/entities/Syllabus';
export { GetSyllabusUseCase } from './domain/usecases/GetSyllabusUseCase';
export { SyllabusMapScreen } from './presentation/screens/SyllabusMapScreen';
export { TopicSessionScreen } from './presentation/screens/TopicSessionScreen';
