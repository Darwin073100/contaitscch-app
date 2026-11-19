import { View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';

type StartupErrorProps = { detail: string; onRetry: () => void };

/**
 * Pantalla cuando la app no pudo arrancar (base local, migraciones, contenido). Muestra el detalle
 * técnico: en la app web de la pantalla de inicio de iPhone no hay consola para verlo.
 */
export function StartupError({ detail, onRetry }: StartupErrorProps) {
  return (
    <View className="flex-1 justify-center gap-4 bg-bg px-6">
      <AppText variant="title">No se pudo abrir CONTAITSCCH</AppText>
      <AppText tone="muted">
        Cierra la app y vuelve a abrirla. Si sigue pasando, comparte este detalle con el equipo:
      </AppText>
      <AppText variant="caption" selectable>
        {detail}
      </AppText>
      <Button label="Reintentar" onPress={onRetry} />
    </View>
  );
}
