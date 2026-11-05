// Strategy: se puede cambiar de algoritmo sin tocar los casos de uso.
export interface PasswordHasher {
  /** Sal aleatoria nueva en hex. */
  createSalt(): Promise<string>;
  /** Hash de la contraseña en hex. La contraseña en texto plano nunca sale de aquí. */
  hash(password: string, salt: string, iterations: number): Promise<string>;
}
