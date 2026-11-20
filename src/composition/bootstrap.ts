import { eq } from 'drizzle-orm';

import { SystemClock } from '@/core/clock/Clock';
import { openAppDatabase } from '@/core/database/client';
import type { AppDatabase } from '@/core/database/database';
import { users } from '@/core/database/schema';
import { migrateDatabase } from '@/core/database/migrate';
import { ContentSeeder } from '@/core/database/seed/ContentSeeder';
import { loadCourse } from '@/core/database/seed/loadCourse';
import { SqliteUnitOfWork } from '@/core/database/SqliteUnitOfWork';
import { NetInfoConnectivity } from '@/core/network/NetInfoConnectivity';
import { createSupabaseClient } from '@/core/network/supabaseClient';
import { SecureSessionStore } from '@/core/session/SecureSessionStore';
import { secureStorage } from '@/core/session/secureStorage';
import { setupWebApp } from '@/core/web/setupWebApp';

import { startAutoSync } from './autoSync';
import { createContainer, type Container } from './container';

let started: Promise<Container> | null = null;

/**
 * Prepara la app una sola vez por proceso: abre SQLite, aplica las migraciones, siembra el
 * contenido si cambió `manifest.version`, carga la sesión de SecureStore, arma el contenedor y
 * arranca la sincronización automática del avance.
 */
export function bootstrap(): Promise<Container> {
  // Si falla, "Reintentar" vuelve a empezar desde cero
  started ??= start().catch((error: unknown) => {
    started = null;
    throw error;
  });
  return started;
}

async function start(): Promise<Container> {
  await setupWebApp();
  const remote = createSupabaseClient();
  const db = await openAppDatabase();
  const clock = new SystemClock();
  await migrateDatabase(db);
  await new ContentSeeder(db, new SqliteUnitOfWork(db), clock).seedIfNeeded(loadCourse());
  const session = new SecureSessionStore(secureStorage);
  await session.load();
  await dropOrphanSession(db, session);
  const container = createContainer({
    db,
    session,
    clock,
    remote,
    connectivity: new NetInfoConnectivity(),
  });
  // Vive lo que vive la app: no hace falta detenerla
  startAutoSync(container);
  return container;
}

/**
 * Sesión sin su usuario en SQLite: la base local se perdió (navegador que borró sus datos, cambio de
 * almacenamiento en la versión web, Llavero de iOS que sobrevive a desinstalar). Se cierra la sesión
 * y al volver a entrar se restauran el perfil y el avance desde la nube.
 */
async function dropOrphanSession(db: AppDatabase, session: SecureSessionStore): Promise<void> {
  const current = session.current();
  if (!current) return;
  const user = db.select({ id: users.id }).from(users).where(eq(users.id, current.userId)).get();
  if (!user) await session.clear();
}
