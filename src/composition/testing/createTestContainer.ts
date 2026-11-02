import { subtopicProgress, topicProgress } from '@/core/database/schema';
import {
  createSeededTestDatabase,
  TEST_USER_ID,
  testClock,
  testSession,
} from '@/core/database/testing/createSeededTestDatabase';

import { createContainer, type Container } from '../container';

export type TestProgress = {
  completedTopics?: number[];
  viewedSubtopics?: number[];
};

/**
 * Contenedor real sobre SQLite en memoria con el contenido del curso, para pruebas de pantallas.
 * Vive en composition porque presentation no puede tocar la base de datos.
 */
export async function createTestContainer(progress: TestProgress = {}): Promise<Container> {
  const db = await createSeededTestDatabase();
  const at = testClock.nowIso();
  const { completedTopics = [], viewedSubtopics = [] } = progress;
  if (completedTopics.length > 0) {
    db.insert(topicProgress)
      .values(
        completedTopics.map((topicId) => ({ userId: TEST_USER_ID, topicId, completedAt: at })),
      )
      .run();
  }
  if (viewedSubtopics.length > 0) {
    db.insert(subtopicProgress)
      .values(
        viewedSubtopics.map((subtopicId) => ({ userId: TEST_USER_ID, subtopicId, viewedAt: at })),
      )
      .run();
  }
  return createContainer({ db, session: testSession, clock: testClock });
}
