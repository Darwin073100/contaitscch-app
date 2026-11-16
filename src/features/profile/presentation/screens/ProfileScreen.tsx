import type { ReactNode } from 'react';

import { AppText, Callout, MenuList, Screen } from '@/shared/ui';

import { ConfirmCard } from '../components/ConfirmCard';
import { LevelProgressCard } from '../components/LevelProgressCard';
import { ProfileCard } from '../components/ProfileCard';
import { SyncCard } from '../components/SyncCard';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

type ProfileScreenProps = {
  /** Barra superior (la arma la ruta con la sesión del usuario). */
  header: ReactNode;
};

/** Pestaña Perfil: alumno, sincronización, avance, reiniciar avance y cerrar sesión. */
export function ProfileScreen({ header }: ProfileScreenProps) {
  const vm = useProfileViewModel();
  const profile = vm.state.status === 'ready' ? vm.state.profile : null;
  const pending = profile?.pendingCount ?? 0;

  return (
    <Screen header={header} scroll>
      {vm.state.status === 'loading' && <AppText variant="caption">Cargando…</AppText>}
      {vm.state.status === 'error' && <Callout tone="danger" text={vm.state.message} />}
      {profile && (
        <>
          <ProfileCard {...profile.card} />
          <SyncCard sync={profile.sync} syncing={vm.busy === 'sync'} onSyncNow={vm.syncNow} />
          {vm.message && (
            <Callout variant="plain" tone="accent" icon="information" text={vm.message} />
          )}
          <LevelProgressCard levels={profile.levels} examLine={profile.examLine} />

          {vm.confirm === 'reset' && (
            <ConfirmCard
              title="¿Borrar todo tu avance?"
              text="Se perderán los temas aprobados y los intentos del examen, aquí y en la nube. Tu cuenta se conserva."
              confirmLabel="Borrar avance"
              busy={vm.busy === 'reset'}
              onConfirm={vm.reset}
              onCancel={vm.cancel}
            />
          )}
          {vm.confirm === 'logout' && (
            <ConfirmCard
              title={`Tienes ${pending} ${pending === 1 ? 'cambio' : 'cambios'} sin sincronizar`}
              text="Se quedan guardados en este teléfono y se suben cuando vuelvas a iniciar sesión aquí. En otro teléfono no los verás hasta entonces."
              confirmLabel="Cerrar sesión"
              busy={vm.busy === 'logout'}
              onConfirm={vm.logout}
              onCancel={vm.cancel}
            />
          )}

          <MenuList
            items={[
              { label: 'Conoce CONTAITSCCH', icon: 'information-outline', onPress: vm.openAbout },
              {
                label: 'Glosario contable',
                icon: 'book-open-page-variant-outline',
                onPress: vm.openGlossary,
              },
              {
                label: 'Reiniciar mi avance',
                icon: 'restart',
                iconColor: 'amber-text',
                onPress: vm.askReset,
              },
              { label: 'Cerrar sesión', icon: 'logout', danger: true, onPress: vm.askLogout },
            ]}
          />
          <AppText variant="caption" tone="faint">
            Los temas fiscales de los Niveles 5 y 6 (IVA con tasa general de 16% e ISR en forma
            conceptual) son introductorios. Antes de usar la app de forma oficial, conviene que un
            contador los revise contra las disposiciones vigentes del SAT.
          </AppText>
        </>
      )}
    </Screen>
  );
}
