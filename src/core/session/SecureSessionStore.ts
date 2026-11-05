import { z } from 'zod';

import type { Session, SessionManager } from './SessionStore';

/** Almacén de texto clave-valor. En la app es SecureStore (secureStorage.ts); en pruebas, memoria. */
export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
};

const STORAGE_KEY = 'contaitscch.session';

const SessionSchema = z.object({
  userId: z.string().min(1),
  apiToken: z.string().min(1),
  email: z.string().min(1),
  emailVerified: z.boolean(),
});

/**
 * Sesión en memoria (lectura síncrona para los repositorios) respaldada en SecureStore.
 * Se carga una vez al arrancar con `load()`.
 */
export class SecureSessionStore implements SessionManager {
  private session: Session | null = null;
  private readonly listeners = new Set<() => void>();

  constructor(private readonly storage: KeyValueStorage) {}

  /** Lee la sesión guardada. Si está dañada o es de otra versión, se descarta. */
  async load(): Promise<void> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    const parsed = raw === null ? null : SessionSchema.safeParse(safeJson(raw));
    if (parsed && !parsed.success) await this.storage.deleteItem(STORAGE_KEY);
    this.set(parsed?.success ? parsed.data : null);
  }

  current(): Session | null {
    return this.session;
  }

  requireUserId(): string {
    if (!this.session) throw new Error('No hay sesión iniciada');
    return this.session.userId;
  }

  async save(session: Session): Promise<void> {
    await this.storage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.set(session);
  }

  async markEmailVerified(): Promise<void> {
    if (this.session) await this.save({ ...this.session, emailVerified: true });
  }

  async clear(): Promise<void> {
    await this.storage.deleteItem(STORAGE_KEY);
    this.set(null);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private set(session: Session | null): void {
    this.session = session;
    this.listeners.forEach((listener) => listener());
  }
}

function safeJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
