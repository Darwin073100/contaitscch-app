import { eq } from 'drizzle-orm';

import type { Clock } from '@/core/clock/Clock';
import type { AppDatabase } from '@/core/database/database';
import { syncState } from '@/core/database/schema';
import { databaseOf } from '@/core/database/SqliteUnitOfWork';
import type { SessionStore } from '@/core/session/SessionStore';
import type { Tx } from '@/core/transaction/UnitOfWork';

import type { SyncErrorCode, SyncState } from '../../domain/entities/Sync';
import type { SyncStateRepository } from '../../domain/repositories/SyncStateRepository';

const errorCodes: readonly string[] = ['offline', 'network', 'invalid_input', 'invalid_token'];
const toErrorCode = (value: string | null): SyncErrorCode | null =>
  value !== null && errorCodes.includes(value) ? (value as SyncErrorCode) : null;

export class SqliteSyncStateRepository implements SyncStateRepository {
  constructor(
    private readonly db: AppDatabase,
    private readonly session: SessionStore,
    private readonly clock: Clock,
  ) {}

  async get(): Promise<SyncState> {
    const row = this.db
      .select({
        generation: syncState.generation,
        lastSyncedAt: syncState.lastSyncedAt,
        lastError: syncState.lastError,
      })
      .from(syncState)
      .where(eq(syncState.userId, this.session.requireUserId()))
      .get();
    if (!row) return { generation: null, lastSyncedAt: null, lastError: null };
    return { ...row, lastError: toErrorCode(row.lastError) };
  }

  async save(state: SyncState, tx?: Tx): Promise<void> {
    const db = tx ? databaseOf(tx) : this.db;
    const values = { ...state, updatedAt: this.clock.nowIso() };
    db.insert(syncState)
      .values({ userId: this.session.requireUserId(), ...values })
      .onConflictDoUpdate({ target: syncState.userId, set: values })
      .run();
  }
}
