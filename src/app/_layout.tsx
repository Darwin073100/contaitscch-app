import '@/global.css';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import type { ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { AppProviders } from '@/composition/providers/AppProviders';
import { useBootstrap } from '@/composition/providers/useBootstrap';
import { RootNavigator } from '@/composition/RootNavigator';
import { StartupError } from '@/shared/ui';

SplashScreen.preventAutoHideAsync();

/** Si el arranque falla, se muestra el motivo en vez de una pantalla vacía. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  // En web se recarga la página: el service worker y el aislamiento se vuelven a intentar
  const onRetry = Platform.OS === 'web' ? () => window.location.reload() : () => void retry();
  return <StartupError detail={error.message} onRetry={onRetry} />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const container = useBootstrap();
  const ready = (fontsLoaded || fontError !== null) && container !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <AppProviders container={container}>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProviders>
  );
}
