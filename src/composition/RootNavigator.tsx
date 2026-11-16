import { Stack } from 'expo-router';

import { useThemeColors } from '@/shared/theme';

import { useSession } from './providers/useSession';

/**
 * Guard de sesión (ARCHITECTURE.md, Navegación):
 * - sin sesión → registro o inicio de sesión
 * - sesión sin verificar → verificación (puede volver al registro para corregir datos)
 * - sesión verificada → pestañas y sesiones de tema, sin volver a pedir login
 * Al cambiar la sesión (useSession) las rutas que dejan de estar permitidas redirigen solas.
 */
export function RootNavigator() {
  const colors = useThemeColors();
  const session = useSession();
  const verified = session?.emailVerified === true;
  const pending = session !== null && !verified;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={verified} redirectTo={pending ? '/verificar-correo' : '/registro'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="tema/[topicId]" />
        <Stack.Screen name="ejercicio/[quizId]" />
      </Stack.Protected>
      <Stack.Protected guard={pending} redirectTo={verified ? '/' : '/registro'}>
        <Stack.Screen name="(auth)/verificar-correo" />
      </Stack.Protected>
      {/* Sin sesión o con el correo sin verificar se puede iniciar sesión (reemplaza la sesión) */}
      <Stack.Protected guard={!verified} redirectTo="/">
        <Stack.Screen name="(auth)/registro" />
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>
      <Stack.Screen name="acerca-de" />
    </Stack>
  );
}
