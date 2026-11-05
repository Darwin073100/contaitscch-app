import {
  AppText,
  Badge,
  Button,
  Callout,
  Card,
  Column,
  IconBox,
  OtpInput,
  RichText,
  Row,
} from '@/shared/ui';

import { AuthLayout } from '../components/AuthLayout';
import { CODE_LENGTH, useVerifyEmailViewModel } from '../viewmodels/useVerifyEmailViewModel';

/** Registro, paso 2 "Verificación": código OTP enviado al correo. */
export function VerifyEmailScreen() {
  const vm = useVerifyEmailViewModel();
  const destination = vm.email ? `**${vm.email}**` : 'tu bandeja';

  return (
    <AuthLayout step={1} onLoginPress={vm.openLogin}>
      <Card padding="lg">
        <Column gap="lg">
          <Row justify="center">
            <IconBox icon="email-check-outline" tone="info" size="lg" shape="circle" />
          </Row>
          <Column gap="xs">
            <AppText variant="subtitle" weight="bold" align="center" accessibilityRole="header">
              Confirma tu Correo
            </AppText>
            <RichText
              variant="caption"
              align="center"
              text={`Ingresa el código OTP de ${CODE_LENGTH} dígitos que enviamos a ${destination}.`}
            />
          </Column>

          <OtpInput value={vm.code} onChange={vm.setCode} length={CODE_LENGTH} autoFocus />

          {vm.notice && (
            <Callout
              variant="plain"
              tone={vm.notice.tone}
              icon={vm.notice.tone === 'danger' ? 'alert-circle-outline' : 'information-outline'}
              text={vm.notice.text}
            />
          )}

          <Row justify="center">
            {vm.canResend ? (
              <Button
                label="Reenviar código"
                variant="ghost"
                size="sm"
                leftIcon="refresh"
                onPress={vm.resend}
              />
            ) : (
              <Badge label={vm.resendLabel} icon="clock-outline" size="md" />
            )}
          </Row>

          <Column gap="sm">
            <Button
              label="Validar y Entrar al Curso"
              leftIcon="check-decagram-outline"
              disabled={!vm.canVerify}
              loading={vm.verifying}
              onPress={vm.verify}
            />
            <Button
              label="Corregir mis datos"
              variant="ghost"
              size="sm"
              leftIcon="arrow-left"
              onPress={vm.editData}
            />
          </Column>
        </Column>
      </Card>
    </AuthLayout>
  );
}
