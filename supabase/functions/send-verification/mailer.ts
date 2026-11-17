// Estrategias de envío: API de Gmail (nube) o Mailpit (Supabase local). Se elige por las variables de entorno.
import { toGmailRaw, type VerificationEmail } from './email.ts';

export type Mailer = (email: VerificationEmail) => Promise<void>;

type Env = (key: string) => string | undefined;

/** Gmail si están los 4 secretos; si no, Mailpit si hay MAILPIT_URL; si no, null (no se puede enviar). */
export function createMailer(env: Env, fetcher: typeof fetch = fetch): Mailer | null {
  const clientId = env('GMAIL_CLIENT_ID');
  const clientSecret = env('GMAIL_CLIENT_SECRET');
  const refreshToken = env('GMAIL_REFRESH_TOKEN');
  const sender = env('GMAIL_SENDER');
  if (clientId && clientSecret && refreshToken && sender) {
    return gmailMailer({ clientId, clientSecret, refreshToken, sender }, fetcher);
  }
  const mailpitUrl = env('MAILPIT_URL') ?? (isLocalStack(env) ? LOCAL_MAILPIT_URL : undefined);
  if (mailpitUrl) return mailpitMailer(mailpitUrl, fetcher);
  return null;
}

// Supabase local (CLI): las funciones ven la API como http://kong:8000 y Mailpit como "inbucket" en la red
// de Docker. En la nube SUPABASE_URL es https://<ref>.supabase.co, así que nunca se usa Mailpit allá.
const LOCAL_SUPABASE_URL = 'http://kong:8000';
const LOCAL_MAILPIT_URL = 'http://inbucket:8025';
const isLocalStack = (env: Env) => env('SUPABASE_URL') === LOCAL_SUPABASE_URL;

type GmailConfig = { clientId: string; clientSecret: string; refreshToken: string; sender: string };

function gmailMailer(config: GmailConfig, fetcher: typeof fetch): Mailer {
  return async (email) => {
    const tokenRes = await fetcher('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!tokenRes.ok) throw new Error(`gmail_token_failed ${tokenRes.status}`);
    const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
    if (!accessToken) throw new Error('gmail_token_missing');

    const sendRes = await fetcher('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: toGmailRaw(email, config.sender) }),
    });
    if (!sendRes.ok) throw new Error(`gmail_send_failed ${sendRes.status}`);
  };
}

/** API HTTP de Mailpit (`POST /api/v1/send`): el correo aparece en http://127.0.0.1:54324. */
function mailpitMailer(baseUrl: string, fetcher: typeof fetch): Mailer {
  return async (email) => {
    const res = await fetcher(`${baseUrl.replace(/\/+$/, '')}/api/v1/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: { Email: 'no-reply@contaitscch.local', Name: 'CONTAITSCCH' },
        To: [{ Email: email.to }],
        Subject: email.subject,
        HTML: email.html,
        Text: email.text,
      }),
    });
    if (!res.ok) throw new Error(`mailpit_send_failed ${res.status}`);
  };
}
