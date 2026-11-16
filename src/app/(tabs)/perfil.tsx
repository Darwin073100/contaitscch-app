import { useContainer } from '@/composition/providers/AppProviders';
import { AppText, Button, Screen } from '@/shared/ui';

// Temporal (F8b): se reemplaza por la pantalla Perfil de la feature profile.
// "Cerrar sesión" sirve mientras tanto para probar el registro de nuevo: el guard regresa al paso 1.
export default function ProfileTab() {
  const { auth } = useContainer();

  return (
    <Screen align="center">
      <AppText variant="title">Perfil</AppText>
      <AppText variant="caption">Próximamente</AppText>
      <Button
        label="Cerrar sesión (temporal)"
        variant="ghost"
        size="md"
        leftIcon="logout"
        onPress={() => void auth.logout.execute()}
      />
    </Screen>
  );
}
