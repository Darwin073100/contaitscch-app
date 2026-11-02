import { sql } from 'drizzle-orm';

import { migrateDatabase } from './migrate';
import { levels, topics } from './schema';
import { createTestDatabase } from './testing/createTestDatabase';

describe('migrateDatabase', () => {
  it('crea todas las tablas del esquema', async () => {
    const db = await createTestDatabase();

    const tables = db
      .all<{ name: string }>(
        sql`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%' ORDER BY name`,
      )
      .map((t) => t.name);

    expect(tables).toEqual([
      'content_meta',
      'daily_activity',
      'exam',
      'exam_attempt',
      'level',
      'question',
      'question_option',
      'subtopic',
      'subtopic_progress',
      'topic',
      'topic_progress',
      'user',
      'xp_event',
    ]);
  });

  it('se puede ejecutar de nuevo sin repetir migraciones ni perder datos', async () => {
    const db = await createTestDatabase();
    db.insert(levels).values({ id: 1, name: 'Básico', sortOrder: 1 }).run();

    await migrateDatabase(db);

    expect(db.select().from(levels).all()).toHaveLength(1);
  });

  it('aplica las llaves foráneas', async () => {
    const db = await createTestDatabase();

    expect(() =>
      db.insert(topics).values({ id: 101, levelId: 99, title: 'Sin nivel', sortOrder: 1 }).run(),
    ).toThrow(/FOREIGN KEY/);
  });
});
