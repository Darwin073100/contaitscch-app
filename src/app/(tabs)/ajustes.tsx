import { router } from 'expo-router';

import { AppText, Button, Screen } from '@/shared/ui';

// Temporal: se reemplaza por la pantalla que exporte la feature settings.
// El acceso al registro es solo para revisar la maquetación hasta que exista el guard de sesión.
export default function SettingsTab() {
  return (
    <Screen align="center">
      <AppText variant="title">Ajustes</AppText>
      <AppText variant="caption">Próximamente</AppText>
      <Button
        label="Ver registro (temporal)"
        variant="secondary"
        size="md"
        onPress={() => router.push('/registro')}
      />
    </Screen>
  );
}
