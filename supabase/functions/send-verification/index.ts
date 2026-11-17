// Edge Function send-verification: genera el código (RPC) y lo envía por correo.
// Nube: API de Gmail (secretos GMAIL_* con `npx supabase secrets set`). Local: Mailpit, sin configurar nada.
import { handleSendVerification, type CodeResult } from './handler.ts';
import { createMailer } from './mailer.ts';

const env = (key: string) => Deno.env.get(key);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

/** create_verification_code por PostgREST con la llave de servicio (sin dependencias externas). */
async function createCode(userId: string, apiToken: string): Promise<CodeResult> {
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const res = await fetch(`${env('SUPABASE_URL')}/rest/v1/rpc/create_verification_code`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_user_id: userId, p_token: apiToken }),
  });
  if (!res.ok) throw new Error(`rpc_failed ${res.status}`);
  return (await res.json()) as CodeResult;
}

const mailer = createMailer(env);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ status: 'invalid_token' });

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    // cuerpo inválido: el handler responde invalid_token
  }
  return json(await handleSendVerification(body, { createCode, mailer, log: console.error }));
});
