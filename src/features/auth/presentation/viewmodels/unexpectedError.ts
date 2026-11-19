/**
 * Texto para un fallo que no es de negocio (por ejemplo, la base local del navegador). Incluye el
 * mensaje técnico para poder diagnosticarlo desde la pantalla, sin consola (iPhone, spec 09).
 */
export function unexpectedErrorMessage(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  return `Algo falló en este dispositivo. Intenta de nuevo. Detalle: ${detail}`;
}
