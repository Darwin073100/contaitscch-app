import { useContainer } from '@/composition/providers/AppProviders';
import { AppText, Button, Screen } from '@/shared/ui';

// Temporal: se reemplaza por la pantalla que exporte la feature settings.
// "Cerrar sesión" sirve mientras tanto para probar el registro de nuevo: el guard regresa al paso 1.
export default function SettingsTab() {
  const { auth } = useContainer();

  return (
    <Screen align="center">
      <AppText variant="title">Ajustes</AppText>
      <AppText variant="caption">Próximamente</AppText>
      <Button
        label="Cerrar sesión (temporal)"
        variant="secondary"
        size="md"
        leftIcon="logout"
        onPress={() => void auth.logout.execute()}
      />
    </Screen>
  );
}
