import { AppTopBar } from '@/features/profile';
import { AppText, Screen } from '@/shared/ui';

// Temporal (F8b): se reemplaza por la pantalla de la feature glossary.
export default function GlossaryTab() {
  return (
    <Screen header={<AppTopBar />} align="center">
      <AppText variant="title">Glosario contable</AppText>
      <AppText variant="caption">Próximamente</AppText>
    </Screen>
  );
}
