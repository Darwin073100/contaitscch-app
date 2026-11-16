import { AppHeader, IconButton } from '@/shared/ui';

import { useTopBarViewModel } from '../viewmodels/useTopBarViewModel';

/** Barra superior de las pestañas: marca, indicador de sincronización y avatar (abre Perfil). */
export function AppTopBar() {
  const { initials, sync, openProfile } = useTopBarViewModel();
  return (
    <AppHeader
      initials={initials}
      onProfilePress={openProfile}
      trailing={
        sync && (
          <IconButton
            icon={sync.icon}
            iconColor={sync.color}
            variant="onNavy"
            accessibilityLabel={`${sync.title}. ${sync.detail}`}
            accessibilityHint="Abre tu perfil para ver la sincronización"
            onPress={openProfile}
          />
        )
      }
    />
  );
}
