import { AppText, Button, Card, Column, Icon, Row } from '@/shared/ui';

import type { SyncStatusVm } from '../viewmodels/syncStatusVm';

type SyncCardProps = {
  sync: SyncStatusVm;
  syncing: boolean;
  onSyncNow: () => void;
};

/** Estado de la sincronización del avance con la nube y "Sincronizar ahora". */
export function SyncCard({ sync, syncing, onSyncNow }: SyncCardProps) {
  // Sobre la tarjeta clara los colores "sobre navy" del indicador no se leen: se usan los normales
  const color =
    sync.color === 'navy-dim' ? 'dim' : sync.color === 'accent-soft' ? 'accent' : sync.color;
  return (
    <Card>
      <Column gap="md">
        <Row gap="md">
          <Icon name={sync.icon} color={color === 'amber' ? 'amber-text' : color} size="xl" />
          <Column grow>
            <AppText weight="extrabold">{syncing ? 'Sincronizando…' : sync.title}</AppText>
            {sync.detail !== '' && <AppText variant="caption">{sync.detail}</AppText>}
          </Column>
        </Row>
        <Button
          label="Sincronizar ahora"
          variant="ghost"
          size="md"
          leftIcon="sync"
          loading={syncing}
          disabled={!sync.canSyncNow}
          onPress={onSyncNow}
        />
      </Column>
    </Card>
  );
}
