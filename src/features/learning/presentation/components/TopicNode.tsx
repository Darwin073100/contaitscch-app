import { Badge, Column, IconBox, Row, Tappable, type IconBoxProps } from '@/shared/ui';

import type { NodeStatus } from '../viewmodels/syllabusMapVm';

// Medidas que TopicPath usa para centrar el icono sobre la curva.
// Deben coincidir con shared/ui: Badge md = 32 px, Column gap sm = 8 px, IconBox lg = 56 px, xl = 80 px.
const HINT_HEIGHT = 32;
const GAP = 8;
const ICON_SIZE: Record<NodeStatus, number> = { completed: 56, active: 80, retry: 80, locked: 56 };

export const TOPIC_NODE_WIDTH = 200;

/** Distancia del borde superior del nodo al centro de su icono. */
export function topicNodeAnchor(status: NodeStatus, hasHint: boolean): number {
  return (hasHint ? HINT_HEIGHT + GAP : 0) + ICON_SIZE[status] / 2;
}

const nodeIcon: Record<NodeStatus, Pick<IconBoxProps, 'icon' | 'tone' | 'size'>> = {
  completed: { icon: 'check', tone: 'solid', size: 'lg' },
  active: { icon: 'book-open-variant', tone: 'amberSolid', size: 'xl' },
  retry: { icon: 'replay', tone: 'danger', size: 'xl' },
  locked: { icon: 'lock', tone: 'locked', size: 'lg' },
};

type TopicNodeProps = {
  label: string;
  status: NodeStatus;
  hint?: string;
  accessibilityLabel: string;
  onPress?: () => void;
};

/** Nodo de la ruta: globo (tema actual o por aprobar), círculo de estado y etiqueta. */
export function TopicNode({ label, status, hint, accessibilityLabel, onPress }: TopicNodeProps) {
  const locked = status === 'locked';
  return (
    <Tappable onPress={onPress} disabled={locked} accessibilityLabel={accessibilityLabel}>
      <Column gap="sm">
        {hint && (
          <Row justify="center">
            <Badge
              label={hint}
              tone={status === 'retry' ? 'danger' : 'navy'}
              appearance="solid"
              size="md"
              icon={status === 'retry' ? 'replay' : 'play'}
            />
          </Row>
        )}
        <Row justify="center">
          <IconBox shape="circle" {...nodeIcon[status]} />
        </Row>
        <Row justify="center">
          <Badge
            label={label}
            tone={status === 'retry' ? 'danger' : status === 'active' ? 'amber' : 'neutral'}
            appearance={status === 'completed' ? 'solid' : 'soft'}
            size="md"
          />
        </Row>
      </Column>
    </Tappable>
  );
}
