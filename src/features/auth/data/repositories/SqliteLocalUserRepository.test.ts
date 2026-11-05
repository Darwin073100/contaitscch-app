import type { AppDatabase } from '@/core/database/database';
import { users } from '@/core/database/schema';
import { testClock } from '@/core/database/testing/createSeededTestDatabase';
import { createTestDatabase } from '@/core/database/testing/createTestDatabase';

import { SqliteLocalUserRepository } from './SqliteLocalUserRepository';

const ana = {
  id: '592e3765-89e6-405f-9e3b-0666d45e3e2b',
  email: 'ana@correo.com',
  firstName: 'Ana',
  lastName: 'López',
  country: 'México',
  state: 'Chiapas',
  city: null,
  emailVerified: false,
};

describe('SqliteLocalUserRepository', () => {
  let db: AppDatabase;
  let repo: SqliteLocalUserRepository;

  beforeEach(async () => {
    db = await createTestDatabase();
    repo = new SqliteLocalUserRepository(db, testClock);
  });

  it('inserta el usuario', async () => {
    await repo.save(ana);

    expect(db.select().from(users).all()).toEqual([expect.objectContaining(ana)]);
  });

  it('si ya existe lo actualiza (por ejemplo, al verificar o al volver a iniciar sesión)', async () => {
    await repo.save(ana);
    await repo.save({ ...ana, firstName: 'Anita', emailVerified: true });

    expect(db.select().from(users).all()).toEqual([
      expect.objectContaining({
        firstName: 'Anita',
        emailVerified: true,
        updatedAt: testClock.nowIso(),
      }),
    ]);
  });
});
