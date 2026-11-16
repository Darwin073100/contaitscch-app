import { Button, Callout, Card, Column } from '@/shared/ui';

import { AuthLayout } from '../components/AuthLayout';
import { FormTextField } from '../components/FormTextField';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

/** Inicio de sesión: en un teléfono nuevo también restaura el avance de la nube. */
export function LoginScreen() {
  const { control, focus, submit, submitting, formError, openRegister } = useLoginViewModel();

  return (
    <AuthLayout mode="login" onSwitch={openRegister}>
      <Card>
        <Column gap="lg">
          <FormTextField
            control={control}
            name="email"
            label="Correo electrónico"
            leftIcon="email-outline"
            placeholder="tu.correo@itsch.edu.mx"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => focus('password')}
          />
          <FormTextField
            control={control}
            name="password"
            label="Contraseña"
            leftIcon="lock-outline"
            placeholder="Tu contraseña"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="send"
            onSubmitEditing={submit}
          />
          {formError && (
            <Callout variant="plain" tone="danger" icon="alert-circle" text={formError} />
          )}
          <Button
            label={submitting ? 'Recuperando tu avance…' : 'Iniciar sesión'}
            leftIcon="login"
            loading={submitting}
            onPress={submit}
          />
        </Column>
      </Card>
    </AuthLayout>
  );
}
