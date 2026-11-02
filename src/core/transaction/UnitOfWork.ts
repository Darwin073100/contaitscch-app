// Puerto de transacciones. Vive fuera de core/database para que domain pueda usarlo
// (domain no importa @/core/database/*); la implementación es SqliteUnitOfWork.

declare const txBrand: unique symbol;

/** Transacción abierta. El dominio no ve su contenido: solo la pasa a los repositorios. */
export type Tx = { readonly [txBrand]: never };

export interface UnitOfWork {
  /**
   * Ejecuta `work` en una sola transacción: si termina, se confirma todo; si lanza, se deshace todo.
   * Las transacciones se ejecutan una tras otra. No anidar: dentro de `work` usa el `tx` recibido.
   */
  run<T>(work: (tx: Tx) => Promise<T>): Promise<T>;
}
