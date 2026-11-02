import type { AppDatabase } from './database';
import { levels, topics } from './schema';
import { databaseOf, SqliteUnitOfWork } from './SqliteUnitOfWork';
import { createTestDatabase } from './testing/createTestDatabase';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('SqliteUnitOfWork', () => {
  let db: AppDatabase;
  let uow: SqliteUnitOfWork;

  beforeEach(async () => {
    db = await createTestDatabase();
    uow = new SqliteUnitOfWork(db);
  });

  it('confirma todas las escrituras y devuelve el resultado', async () => {
    const result = await uow.run(async (tx) => {
      databaseOf(tx).insert(levels).values({ id: 1, name: 'Básico', sortOrder: 1 }).run();
      await tick();
      databaseOf(tx).insert(topics).values({ id: 101, levelId: 1, title: 'T', sortOrder: 1 }).run();
      return 'listo';
    });

    expect(result).toBe('listo');
    expect(db.select().from(topics).all()).toHaveLength(1);
  });

  it('deshace todo si el trabajo falla, aunque falle después de un await', async () => {
    const work = uow.run(async (tx) => {
      databaseOf(tx).insert(levels).values({ id: 1, name: 'Básico', sortOrder: 1 }).run();
      await tick();
      // Nivel inexistente: falla la llave foránea
      databaseOf(tx).insert(topics).values({ id: 201, levelId: 2, title: 'T', sortOrder: 1 }).run();
    });

    await expect(work).rejects.toThrow(/FOREIGN KEY/);
    expect(db.select().from(levels).all()).toHaveLength(0);
  });

  it('ejecuta las transacciones una tras otra', async () => {
    const order: string[] = [];

    const first = uow.run(async () => {
      order.push('primera:inicio');
      await tick();
      order.push('primera:fin');
    });
    const second = uow.run(async () => {
      order.push('segunda');
    });
    await Promise.all([first, second]);

    expect(order).toEqual(['primera:inicio', 'primera:fin', 'segunda']);
  });

  it('sigue funcionando después de una transacción fallida', async () => {
    await expect(
      uow.run(async () => {
        throw new Error('falla');
      }),
    ).rejects.toThrow('falla');

    await uow.run(async (tx) => {
      databaseOf(tx).insert(levels).values({ id: 1, name: 'Básico', sortOrder: 1 }).run();
    });

    expect(db.select().from(levels).all()).toHaveLength(1);
  });
});
