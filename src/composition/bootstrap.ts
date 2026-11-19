import { SystemClock } from '@/core/clock/Clock';
import { openAppDatabase } from '@/core/database/client';
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
  started ??= start();
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
