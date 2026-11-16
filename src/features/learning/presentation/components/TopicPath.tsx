import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useThemeColors } from '@/shared/theme';

import type { GoalNodeVm, TopicNodeVm } from '../viewmodels/syllabusMapVm';
import { EXAM_NODE_ANCHOR, EXAM_NODE_WIDTH, ExamNode } from './ExamNode';
import { TOPIC_NODE_WIDTH, TopicNode, topicNodeAnchor } from './TopicNode';

// Geometría del camino. Los estilos en línea de este archivo son posiciones calculadas
// (dato, no diseño), igual que la altura de las bases del podio.
const ROW_HEIGHT = 160;
const TOP_MARGIN = 8;
/** Desplazamiento horizontal de los nodos respecto al centro, en fracción del ancho. */
const SWING = 0.18;
const HALO_RADIUS = 64;
const STROKE = 8;
/** Espacio bajo el centro del examen para su título y subtítulo. */
const EXAM_BOTTOM = 112;

type Point = { x: number; y: number };

/** Curva en "S" entre dos centros consecutivos. */
function segment(from: Point, to: Point): string {
  const midY = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
}

/** Ancho del nodo centrado en x sin salirse del contenedor. */
function nodeBox(x: number, width: number, maxWidth: number) {
  const w = Math.min(maxWidth, 2 * Math.min(x, width - x));
  return { left: x - w / 2, width: w };
}

type TopicPathProps = {
  nodes: TopicNodeVm[];
  goal: GoalNodeVm;
  onOpenTopic: (topicId: number) => void;
  onOpenGoal: () => void;
};

/** Ruta del nivel: camino curvo con los temas alternando a izquierda y derecha, y la meta al final. */
export function TopicPath({ nodes, goal, onOpenTopic, onOpenGoal }: TopicPathProps) {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const first = nodes[0];
  const firstY = TOP_MARGIN + (first ? topicNodeAnchor(first.status, Boolean(first.hint)) : 0);
  const topicPoints: Point[] = nodes.map((_, i) => ({
    x: width / 2 + (i % 2 === 0 ? -1 : 1) * SWING * width,
    y: firstY + i * ROW_HEIGHT,
  }));
  const examPoint: Point = { x: width / 2, y: firstY + nodes.length * ROW_HEIGHT };
  const height = examPoint.y + EXAM_BOTTOM;

  const points = [...topicPoints, examPoint];
  // Un tramo es sólido si su origen ya está aprobado (como en el prototipo).
  const reached = [false, ...nodes.map((n) => n.status === 'completed')];
  const segments = points
    .slice(1)
    .map((to, i) => ({ d: segment(points[i], to), solid: reached[i + 1] }));

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <>
          <Svg width={width} height={height}>
            {nodes.map((node, i) =>
              node.status === 'active' || node.status === 'retry' ? (
                <Circle
                  key={node.id}
                  cx={topicPoints[i].x}
                  cy={topicPoints[i].y}
                  r={HALO_RADIUS}
                  fill={node.status === 'retry' ? colors.err : colors.amber}
                  opacity={0.15}
                />
              ) : null,
            )}
            {segments
              .filter((s) => !s.solid)
              .map((s) => (
                <Path
                  key={s.d}
                  d={s.d}
                  stroke={colors.line}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray="10 18"
                  fill="none"
                />
              ))}
            {segments
              .filter((s) => s.solid)
              .map((s) => (
                <Path
                  key={s.d}
                  d={s.d}
                  stroke={colors.accent}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
          </Svg>

          {nodes.map((node, i) => (
            <View
              key={node.id}
              style={{
                position: 'absolute',
                top: topicPoints[i].y - topicNodeAnchor(node.status, Boolean(node.hint)),
                ...nodeBox(topicPoints[i].x, width, TOPIC_NODE_WIDTH),
              }}
            >
              <TopicNode
                label={node.label}
                status={node.status}
                hint={node.hint}
                accessibilityLabel={node.accessibilityLabel}
                onPress={() => onOpenTopic(node.id)}
              />
            </View>
          ))}

          <View
            style={{
              position: 'absolute',
              top: examPoint.y - EXAM_NODE_ANCHOR,
              ...nodeBox(examPoint.x, width, EXAM_NODE_WIDTH),
            }}
          >
            <ExamNode
              title={goal.title}
              caption={goal.caption}
              status={goal.status}
              icon={goal.target.kind === 'exam' ? 'medal' : 'flag-checkered'}
              accessibilityLabel={goal.accessibilityLabel}
              onPress={onOpenGoal}
            />
          </View>
        </>
      )}
    </View>
  );
}
