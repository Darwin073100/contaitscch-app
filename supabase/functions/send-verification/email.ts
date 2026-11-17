// Contenido del correo con el código de verificación (sin dependencias de Deno: se puede probar aparte).

export type VerificationEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function buildVerificationEmail(to: string, code: string): VerificationEmail {
  return {
    to,
    subject: 'Tu código de verificación de CONTAITSCCH',
    text: `Tu código para entrar a CONTAITSCCH es: ${code}\n\nVence en 10 minutos. Si no fuiste tú, ignora este correo.`,
    html: `<div style="font-family:Arial,sans-serif;color:#0f2a44;max-width:480px">
  <p>Tu código para entrar a <strong>CONTAITSCCH</strong> es:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#0e7c7b">${code}</p>
  <p>Vence en 10 minutos. Si no fuiste tú, ignora este correo.</p>
  <p style="color:#6b7a8c;font-size:12px">ITSCCH · Instituto Tecnológico Superior de la Costa Chica</p>
</div>`,
  };
}

const utf8Base64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
};

/** Mensaje MIME (RFC 2822) en base64url, como lo pide `users.messages.send` de la API de Gmail. */
export function toGmailRaw(email: VerificationEmail, from: string): string {
  const mime = [
    `From: CONTAITSCCH <${from}>`,
    `To: ${email.to}`,
    `Subject: =?UTF-8?B?${utf8Base64(email.subject)}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    utf8Base64(email.html),
  ].join('\r\n');
  return utf8Base64(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
