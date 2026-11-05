import { eq } from 'drizzle-orm';

import type { Clock } from '@/core/clock/Clock';
import type { AppDatabase } from '@/core/database/database';
import { users } from '@/core/database/schema';

import type { LocalUserRepository } from '../../domain/repositories/LocalUserRepository';

export class SqliteLocalUserRepository implements LocalUserRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly clock: Clock,
  ) {}

  async save(user: Parameters<LocalUserRepository['save']>[0]): Promise<void> {
    const { id, ...data } = user;
    this.db
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: { ...data, updatedAt: this.clock.nowIso() },
      })
      .run();
  }

  async markEmailVerified(id: string): Promise<void> {
    this.db
      .update(users)
      .set({ emailVerified: true, updatedAt: this.clock.nowIso() })
      .where(eq(users.id, id))
      .run();
  }
}
