// Lógica de send-verification, separada de Deno.serve para poder probarla con dobles.
// Contrato con la app (SupabaseAuthRemoteDataSource): SIEMPRE HTTP 200 con { status, ... }.
import { buildVerificationEmail } from './email.ts';
import type { Mailer } from './mailer.ts';

export type CodeResult =
  | { status: 'ok'; email: string; code: string; resend_in_seconds: number }
  | { status: 'cooldown'; retry_in_seconds: number }
  | { status: 'already_verified' }
  | { status: 'invalid_token' };

/** Llama la RPC create_verification_code con la llave de servicio (la única que puede ejecutarla). */
export type CreateCode = (userId: string, apiToken: string) => Promise<CodeResult>;

export type SendResponse =
  | { status: 'ok'; resend_in_seconds: number }
  | { status: 'cooldown'; retry_in_seconds: number }
  | { status: 'already_verified' }
  | { status: 'invalid_token' }
  | { status: 'send_failed' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function handleSendVerification(
  body: unknown,
  deps: { createCode: CreateCode; mailer: Mailer | null; log?: (message: string) => void },
): Promise<SendResponse> {
  const log = deps.log ?? (() => {});
  const { userId, apiToken } = (body ?? {}) as { userId?: unknown; apiToken?: unknown };
  if (
    typeof userId !== 'string' ||
    typeof apiToken !== 'string' ||
    !UUID.test(userId) ||
    !UUID.test(apiToken)
  ) {
    return { status: 'invalid_token' };
  }
  if (!deps.mailer) {
    log('send-verification: no hay GMAIL_* ni MAILPIT_URL configurados');
    return { status: 'send_failed' };
  }

  let result: CodeResult;
  try {
    result = await deps.createCode(userId, apiToken);
  } catch (error) {
    log(`send-verification: falló create_verification_code (${String(error)})`);
    return { status: 'send_failed' };
  }
  if (result.status !== 'ok') return result;

  try {
    await deps.mailer(buildVerificationEmail(result.email, result.code));
  } catch (error) {
    // Nunca se loguean el código ni el correo: solo el motivo técnico.
    log(`send-verification: no se pudo enviar (${String(error)})`);
    return { status: 'send_failed' };
  }
  return { status: 'ok', resend_in_seconds: result.resend_in_seconds };
}
