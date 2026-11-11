import { courseRecords, InMemoryCourseProgressReader } from '../testing/courseRecords';
import { GetCourseProgressUseCase } from './GetCourseProgressUseCase';

describe('GetCourseProgressUseCase', () => {
  it('aplica las reglas de avance a los temas del repositorio', async () => {
    const reader = new InMemoryCourseProgressReader(courseRecords({ passed: [101] }));

    const progress = await new GetCourseProgressUseCase(reader).execute();

    expect(progress.passedCount).toBe(1);
    expect(progress.totalCount).toBe(8);
    expect(progress.nextLesson?.topicId).toBe(102);
  });
});
