import { SecureSessionStore } from './SecureSessionStore';
import type { Session } from './SessionStore';
import { memoryStorage } from './testing/memoryStorage';

const session: Session = {
  userId: 'id-1',
  apiToken: 'token-1',
  email: 'ana@correo.com',
  emailVerified: false,
};

describe('SecureSessionStore', () => {
  it('sin sesión guardada: current es null y requireUserId lanza', async () => {
    const store = new SecureSessionStore(memoryStorage().storage);
    await store.load();

    expect(store.current()).toBeNull();
    expect(() => store.requireUserId()).toThrow('No hay sesión iniciada');
  });

  it('guarda la sesión y la recupera al volver a abrir la app', async () => {
    const { storage } = memoryStorage();
    await new SecureSessionStore(storage).save(session);

    const reopened = new SecureSessionStore(storage);
    await reopened.load();

    expect(reopened.current()).toEqual(session);
    expect(reopened.requireUserId()).toBe('id-1');
  });

  it('descarta una sesión guardada dañada', async () => {
    const { storage, data } = memoryStorage({ 'contaitscch.session': '{"userId": 1' });
    const store = new SecureSessionStore(storage);

    await store.load();

    expect(store.current()).toBeNull();
    expect(data.size).toBe(0);
  });

  it('marca el correo como verificado y lo persiste', async () => {
    const { storage } = memoryStorage();
    const store = new SecureSessionStore(storage);
    await store.save(session);

    await store.markEmailVerified();

    const reopened = new SecureSessionStore(storage);
    await reopened.load();
    expect(reopened.current()?.emailVerified).toBe(true);
  });

  it('avisa a los suscriptores en cada cambio y deja de avisar al desuscribirse', async () => {
    const store = new SecureSessionStore(memoryStorage().storage);
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);

    await store.save(session);
    await store.clear();
    unsubscribe();
    await store.save(session);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.current()).toEqual(session);
  });
});
