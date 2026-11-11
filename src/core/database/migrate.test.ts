import { sql } from 'drizzle-orm';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

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
      'glossary_term',
      'leaderboard_cache',
      'level',
      'question',
      'question_option',
      'quiz',
      'quiz_progress',
      'sync_state',
      'topic',
      'user',
    ]);
  });

  it('se puede ejecutar de nuevo sin repetir migraciones ni perder datos', async () => {
    const db = await createTestDatabase();
    db.insert(levels).values({ id: 1, sortOrder: 1, title: 'Fundamentos', goal: 'Meta' }).run();

    await migrateDatabase(db);

    expect(db.select().from(levels).all()).toHaveLength(1);
  });

  it('aplica las llaves foráneas', async () => {
    const db = await createTestDatabase();

    expect(() =>
      db
        .insert(topics)
        .values({
          id: 101,
          levelId: 99,
          sortOrder: 1,
          title: 'Sin nivel',
          objective: 'O',
          content: '{}',
        })
        .run(),
    ).toThrow(/FOREIGN KEY/);
  });
});

const migration = (file: string) => readFileSync(join(__dirname, 'migrations', file), 'utf8');

describe('0002_cliente_v2', () => {
  it('migra una base v1 con avance y XP: conserva al usuario y fuerza la resiembra', () => {
    const sqlite = new DatabaseSync(':memory:');
    sqlite.exec('PRAGMA foreign_keys = ON;');
    sqlite.exec(migration('0000_init.sql'));
    sqlite.exec(migration('0001_level_texts.sql'));
    sqlite.exec(`
      INSERT INTO content_meta (id, version) VALUES (1, 2);
      INSERT INTO user (id, first_name, last_name, email, country, state) VALUES ('u1', 'Ana', 'López', 'ana@correo.com', 'México', 'Chiapas');
      INSERT INTO level (id, name, sort_order) VALUES (1, 'Básico', 1);
      INSERT INTO topic (id, level_id, title, sort_order) VALUES (101, 1, 'Tema', 1);
      INSERT INTO subtopic (id, topic_id, title, content, sort_order) VALUES (10101, 101, 'Sub', '[]', 1);
      INSERT INTO subtopic_progress (user_id, subtopic_id, viewed_at) VALUES ('u1', 10101, 'x');
      INSERT INTO topic_progress (user_id, topic_id, completed_at) VALUES ('u1', 101, 'x');
      INSERT INTO exam (id, level_id) VALUES (1, 1);
      INSERT INTO question (id, exam_id, type, statement, sort_order) VALUES (1001, 1, 'multiple_choice', '¿?', 1);
      INSERT INTO question_option (id, question_id, text) VALUES (100101, 1001, 'A');
      INSERT INTO exam_attempt (user_id, exam_id, score, taken_at) VALUES ('u1', 1, 80, 'x');
      INSERT INTO xp_event (user_id, topic_id, points, earned_at) VALUES ('u1', 101, 5, 'x');
      INSERT INTO daily_activity (user_id, activity_date) VALUES ('u1', '2026-11-01');
    `);

    sqlite.exec(migration('0002_cliente_v2.sql'));

    const count = (table: string) =>
      (sqlite.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
    expect(count('user')).toBe(1);
    expect(count('content_meta')).toBe(0);
    expect(count('level')).toBe(0);
    expect(count('quiz_progress')).toBe(0);
    const leftovers = sqlite
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN
         ('xp_event', 'daily_activity', 'exam', 'exam_attempt', 'subtopic', 'subtopic_progress', 'topic_progress')`,
      )
      .all();
    expect(leftovers).toEqual([]);
  });
});
