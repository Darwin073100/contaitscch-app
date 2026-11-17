// Pruebas de la lógica de send-verification (Jest; el código no depende de Deno).
import { buildVerificationEmail, toGmailRaw } from './email.ts';
import { handleSendVerification, type CodeResult } from './handler.ts';
import { createMailer, type Mailer } from './mailer.ts';

const USER = '11111111-1111-4111-8111-111111111111';
const TOKEN = '22222222-2222-4222-8222-222222222222';

const okCode: CodeResult = {
  status: 'ok',
  email: 'ana@correo.com',
  code: '042137',
  resend_in_seconds: 45,
};

function setup(
  result: CodeResult | Error = okCode,
  mailer: Mailer | null = jest.fn().mockResolvedValue(undefined),
) {
  const createCode = jest.fn(async () => {
    if (result instanceof Error) throw result;
    return result;
  });
  const log = jest.fn();
  return { createCode, mailer, log };
}

describe('handleSendVerification', () => {
  it('genera el código, lo envía al correo del perfil y responde ok con el tiempo de reenvío', async () => {
    const deps = setup();
    const res = await handleSendVerification({ userId: USER, apiToken: TOKEN }, deps);

    expect(res).toEqual({ status: 'ok', resend_in_seconds: 45 });
    expect(deps.createCode).toHaveBeenCalledWith(USER, TOKEN);
    expect(deps.mailer).toHaveBeenCalledWith(expect.objectContaining({ to: 'ana@correo.com' }));
  });

  it('nunca devuelve el código a la app', async () => {
    const res = await handleSendVerification({ userId: USER, apiToken: TOKEN }, setup());
    expect(JSON.stringify(res)).not.toContain('042137');
  });

  it('cuerpo sin uuids válidos: invalid_token sin llamar a la base', async () => {
    const deps = setup();
    for (const body of [
      null,
      {},
      { userId: 'x', apiToken: TOKEN },
      { userId: USER, apiToken: 5 },
    ]) {
      expect(await handleSendVerification(body, deps)).toEqual({ status: 'invalid_token' });
    }
    expect(deps.createCode).not.toHaveBeenCalled();
  });

  it.each<CodeResult>([
    { status: 'cooldown', retry_in_seconds: 30 },
    { status: 'already_verified' },
    { status: 'invalid_token' },
  ])('pasa la respuesta $status de la RPC sin enviar correo', async (result) => {
    const deps = setup(result);
    expect(await handleSendVerification({ userId: USER, apiToken: TOKEN }, deps)).toEqual(result);
    expect(deps.mailer).not.toHaveBeenCalled();
  });

  it('sin forma de enviar correo: send_failed sin generar código (no gasta el tiempo de reenvío)', async () => {
    const deps = setup(okCode, null);
    expect(await handleSendVerification({ userId: USER, apiToken: TOKEN }, deps)).toEqual({
      status: 'send_failed',
    });
    expect(deps.createCode).not.toHaveBeenCalled();
  });

  it('falla la RPC o el envío: send_failed y el log no incluye el código ni el correo', async () => {
    const rpcFail = setup(new Error('rpc_failed 500'));
    expect(await handleSendVerification({ userId: USER, apiToken: TOKEN }, rpcFail)).toEqual({
      status: 'send_failed',
    });

    const sendFail = setup(okCode, jest.fn().mockRejectedValue(new Error('gmail_send_failed 403')));
    expect(await handleSendVerification({ userId: USER, apiToken: TOKEN }, sendFail)).toEqual({
      status: 'send_failed',
    });
    const logged = sendFail.log.mock.calls.flat().join(' ');
    expect(logged).toContain('gmail_send_failed');
    expect(logged).not.toContain('042137');
    expect(logged).not.toContain('ana@correo.com');
  });
});

describe('correo', () => {
  it('incluye el código y el vencimiento de 10 minutos', () => {
    const email = buildVerificationEmail('ana@correo.com', '042137');
    expect(email.html).toContain('042137');
    expect(email.text).toContain('10 minutos');
  });

  it('el mensaje para Gmail es base64url y conserva los acentos del asunto', () => {
    const raw = toGmailRaw(buildVerificationEmail('ana@correo.com', '042137'), 'app@gmail.com');
    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/);
    const mime = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    expect(mime).toContain('To: ana@correo.com');
    const subject = /Subject: =\?UTF-8\?B\?(.+)\?=/.exec(mime)?.[1] ?? '';
    expect(Buffer.from(subject, 'base64').toString('utf8')).toBe(
      'Tu código de verificación de CONTAITSCCH',
    );
  });
});

describe('createMailer', () => {
  const env = (values: Record<string, string>) => (key: string) => values[key];
  const gmail = {
    GMAIL_CLIENT_ID: 'id',
    GMAIL_CLIENT_SECRET: 's',
    GMAIL_REFRESH_TOKEN: 'r',
    GMAIL_SENDER: 'app@gmail.com',
  };
  const response = (body: unknown, ok = true) =>
    ({ ok, status: ok ? 200 : 500, json: async () => body }) as Response;

  it('sin GMAIL_* ni MAILPIT_URL no hay mailer', () => {
    expect(createMailer(env({}))).toBeNull();
    expect(createMailer(env({ GMAIL_CLIENT_ID: 'id' }))).toBeNull();
  });

  it('con los secretos de Gmail pide el access token y envía con la API (aunque haya MAILPIT_URL)', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(response({ access_token: 'tok' }))
      .mockResolvedValueOnce(response({ id: 'm1' }));
    const mailer = createMailer(env({ ...gmail, MAILPIT_URL: 'http://mailpit:8025' }), fetcher);
    await mailer!(buildVerificationEmail('ana@correo.com', '042137'));

    expect(fetcher.mock.calls[0][0]).toBe('https://oauth2.googleapis.com/token');
    expect(fetcher.mock.calls[1][0]).toBe(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    );
    expect(fetcher.mock.calls[1][1].headers.Authorization).toBe('Bearer tok');
  });

  it('Gmail responde error: el envío falla', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce(response({ access_token: 'tok' }))
      .mockResolvedValueOnce(response({}, false));
    await expect(
      createMailer(env(gmail), fetcher)!(buildVerificationEmail('a@b.c', '1')),
    ).rejects.toThrow('gmail_send_failed');
  });

  it('en Supabase local (SUPABASE_URL = kong) usa Mailpit sin configurar nada; en la nube no', async () => {
    const fetcher = jest.fn().mockResolvedValue(response({ ID: 'x' }));
    await createMailer(env({ SUPABASE_URL: 'http://kong:8000' }), fetcher)!(
      buildVerificationEmail('a@b.c', '1'),
    );
    expect(fetcher.mock.calls[0][0]).toBe('http://inbucket:8025/api/v1/send');
    expect(createMailer(env({ SUPABASE_URL: 'https://abc.supabase.co' }))).toBeNull();
  });

  it('en local envía a la API de Mailpit', async () => {
    const fetcher = jest.fn().mockResolvedValue(response({ ID: 'x' }));
    await createMailer(env({ MAILPIT_URL: 'http://mailpit:8025/' }), fetcher)!(
      buildVerificationEmail('ana@correo.com', '042137'),
    );

    expect(fetcher.mock.calls[0][0]).toBe('http://mailpit:8025/api/v1/send');
    const body = JSON.parse(fetcher.mock.calls[0][1].body as string);
    expect(body.To).toEqual([{ Email: 'ana@correo.com' }]);
    expect(body.HTML).toContain('042137');
  });
});
