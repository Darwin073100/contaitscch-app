import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

/**
 * Qué versión de la app está corriendo, para que quien reporte un error diga qué tiene instalado.
 * `updateId` identifica el JavaScript en uso: el que venía dentro del APK (`embedded`) o el de una
 * actualización de EAS Update. Es `null` en desarrollo (Expo Go o `expo start`).
 */
export type AppBuild = { version: string | null; updateId: string | null; embedded: boolean };

export function readAppBuild(): AppBuild {
  return {
    version: Constants.expoConfig?.version ?? null,
    updateId: Updates.updateId ?? null,
    embedded: Updates.isEmbeddedLaunch,
  };
}
