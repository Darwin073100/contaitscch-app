import { Badge, Column, IconBox, Row, Tappable, type IconBoxProps } from '@/shared/ui';

import type { TopicStatus } from '../../domain/entities/Syllabus';

// Medidas que TopicPath usa para centrar el icono sobre la curva.
// Deben coincidir con shared/ui: Badge md = 32 px, Column gap sm = 8 px, IconBox lg = 56 px, xl = 80 px.
const HINT_HEIGHT = 32;
const GAP = 8;
const ICON_SIZE: Record<TopicStatus, number> = { completed: 56, active: 80, locked: 56 };

export const TOPIC_NODE_WIDTH = 200;

/** Distancia del borde superior del nodo al centro de su icono. */
export function topicNodeAnchor(status: TopicStatus, hasHint: boolean): number {
  return (hasHint ? HINT_HEIGHT + GAP : 0) + ICON_SIZE[status] / 2;
}

const nodeIcon: Record<TopicStatus, Pick<IconBoxProps, 'icon' | 'tone' | 'size'>> = {
  completed: { icon: 'check', tone: 'primary', size: 'lg' },
  active: { icon: 'book-open-variant', tone: 'accent', size: 'xl' },
  locked: { icon: 'lock-outline', tone: 'neutral', size: 'lg' },
};

type TopicNodeProps = {
  label: string;
  status: TopicStatus;
  hint?: string;
  accessibilityLabel: string;
  onPress?: () => void;
};

/** Nodo del mapa del temario: globo (solo activo), círculo de estado y etiqueta. */
export function TopicNode({ label, status, hint, accessibilityLabel, onPress }: TopicNodeProps) {
  const locked = status === 'locked';
  return (
    <Tappable onPress={onPress} disabled={locked} accessibilityLabel={accessibilityLabel}>
      <Column gap="sm">
        {hint && (
          <Row justify="center">
            <Badge label={hint} tone="accent" appearance="solid" size="md" icon="play" />
          </Row>
        )}
        <Row justify="center">
          <IconBox shape="circle" {...nodeIcon[status]} />
        </Row>
        <Row justify="center">
          <Badge label={label} appearance={locked ? 'soft' : 'solid'} size="md" />
        </Row>
      </Column>
    </Tappable>
  );
}
