import { AppText, Button, Card, Column, Divider, Row } from '@/shared/ui';

import { AuthLayout } from '../components/AuthLayout';
import { FormTextField } from '../components/FormTextField';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';

/** Registro, paso 1 "Tus Datos". */
export function RegisterScreen() {
  const { control, focus, submit, submitting, passwordStrength, openLogin } =
    useRegisterViewModel();

  return (
    <AuthLayout step={0} onLoginPress={openLogin}>
      <Card padding="lg">
        <Column gap="lg">
          <FormTextField
            control={control}
            name="firstName"
            label="Nombre(s) *"
            leftIcon="account-outline"
            placeholder="Ej. Carlos"
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
            onSubmitEditing={() => focus('lastName')}
          />
          <FormTextField
            control={control}
            name="lastName"
            label="Apellidos *"
            leftIcon="card-account-details-outline"
            placeholder="Ej. Gómez Morales"
            autoCapitalize="words"
            autoComplete="family-name"
            textContentType="familyName"
            returnKeyType="next"
            onSubmitEditing={() => focus('email')}
          />
          <FormTextField
            control={control}
            name="email"
            label="Correo Electrónico *"
            leftIcon="email-outline"
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => focus('password')}
          />
          <Column gap="sm">
            <FormTextField
              control={control}
              name="password"
              label="Contraseña *"
              leftIcon="lock-outline"
              placeholder="Tu clave secreta"
              hint="Mínimo 6 caracteres"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => focus('country')}
            />
            <PasswordStrengthMeter strength={passwordStrength} />
          </Column>

          <Divider />

          <AppText variant="overline" tone="accent" accessibilityRole="header">
            Dirección
          </AppText>
          <FormTextField
            control={control}
            name="country"
            label="País *"
            leftIcon="earth"
            placeholder="Ej. México"
            autoCapitalize="words"
            autoComplete="country"
            textContentType="countryName"
            returnKeyType="next"
            onSubmitEditing={() => focus('state')}
          />
          <Row gap="md" align="start">
            <Column grow>
              <FormTextField
                control={control}
                name="state"
                label="Estado *"
                leftIcon="map-marker-outline"
                placeholder="Ej. Veracruz"
                autoCapitalize="words"
                textContentType="addressState"
                returnKeyType="next"
                onSubmitEditing={() => focus('city')}
              />
            </Column>
            <Column grow>
              <FormTextField
                control={control}
                name="city"
                label="Ciudad"
                leftIcon="city-variant-outline"
                placeholder="Opcional"
                autoCapitalize="words"
                textContentType="addressCity"
                returnKeyType="send"
                onSubmitEditing={submit}
              />
            </Column>
          </Row>
        </Column>
      </Card>

      <Button
        label="Crear Cuenta y Recibir Código"
        leftIcon="send-outline"
        loading={submitting}
        onPress={submit}
      />
    </AuthLayout>
  );
}
