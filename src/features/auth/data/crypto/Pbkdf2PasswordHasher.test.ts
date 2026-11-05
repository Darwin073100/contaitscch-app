import { Pbkdf2PasswordHasher } from './Pbkdf2PasswordHasher';

// "salt" en hex: la app siempre maneja la sal como hex
const SALT_HEX = Buffer.from('salt').toString('hex');

describe('Pbkdf2PasswordHasher', () => {
  const hasher = new Pbkdf2PasswordHasher(async (count) => new Uint8Array(count).fill(0xab));

  it.each([
    [1, '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b'],
    [2, 'ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43'],
    [4096, 'c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a'],
  ])(
    'cumple el vector de prueba de PBKDF2-HMAC-SHA256 con c = %i',
    async (iterations, expected) => {
      expect(await hasher.hash('password', SALT_HEX, iterations)).toBe(expected);
    },
  );

  it('normaliza la contraseña (NFKC): "é" compuesta y precompuesta dan el mismo hash', async () => {
    const precomposed = 'café';
    const decomposed = 'café';

    expect(await hasher.hash(decomposed, SALT_HEX, 10)).toBe(
      await hasher.hash(precomposed, SALT_HEX, 10),
    );
  });

  it('crea una sal de 16 bytes en hex con la fuente aleatoria', async () => {
    expect(await hasher.createSalt()).toBe('ab'.repeat(16));
  });

  it('la sal y el hash tienen el formato que exige Postgres', async () => {
    const salt = await hasher.createSalt();

    expect(salt).toMatch(/^[0-9a-f]{32}$/);
    expect(await hasher.hash('secreta123', salt, 10)).toMatch(/^[0-9a-f]{64}$/);
  });
});
