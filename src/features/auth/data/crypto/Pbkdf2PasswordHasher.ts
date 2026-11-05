import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { getRandomBytesAsync } from 'expo-crypto';

import type { PasswordHasher } from '../../domain/ports/PasswordHasher';

const SALT_BYTES = 16;
const KEY_BYTES = 32;

/** PBKDF2-HMAC-SHA256 en JavaScript puro (funciona en Expo Go, sin módulos nativos). */
export class Pbkdf2PasswordHasher implements PasswordHasher {
  constructor(
    private readonly randomBytes: (count: number) => Promise<Uint8Array> = getRandomBytesAsync,
  ) {}

  async createSalt(): Promise<string> {
    return bytesToHex(await this.randomBytes(SALT_BYTES));
  }

  async hash(password: string, salt: string, iterations: number): Promise<string> {
    // NFKC: la misma contraseña escrita con otro teclado (acentos compuestos) da el mismo hash.
    // Async: cede el hilo cada pocos ms y no congela la UI durante ~1 s.
    const key = await pbkdf2Async(sha256, password.normalize('NFKC'), hexToBytes(salt), {
      c: iterations,
      dkLen: KEY_BYTES,
    });
    return bytesToHex(key);
  }
}
