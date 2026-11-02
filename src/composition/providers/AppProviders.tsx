import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Container } from '../container';

const ContainerContext = createContext<Container | null>(null);

type AppProvidersProps = { container: Container; children: ReactNode };

export function AppProviders({ container, children }: AppProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ContainerContext.Provider value={container}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </QueryClientProvider>
    </ContainerContext.Provider>
  );
}

/** Acceso a las dependencias desde los ViewModels. */
export function useContainer(): Container {
  const container = useContext(ContainerContext);
  if (!container) throw new Error('useContainer debe usarse dentro de <AppProviders>');
  return container;
}
