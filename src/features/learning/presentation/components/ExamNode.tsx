import { AppText, Column, IconBox, Row, Tappable, type IconBoxProps } from '@/shared/ui';

import type { ExamStatus } from '../../domain/entities/Syllabus';

/** Distancia del borde superior al centro del icono (IconBox xl = 80 px). */
export const EXAM_NODE_ANCHOR = 40;
export const EXAM_NODE_WIDTH = 200;

const examIcon: Record<ExamStatus, Pick<IconBoxProps, 'tone' | 'cornerIcon'>> = {
  locked: { tone: 'streakSoft', cornerIcon: 'lock' },
  available: { tone: 'streakSoft' },
  passed: { tone: 'primarySoft', cornerIcon: 'check' },
};

type ExamNodeProps = {
  title: string;
  caption: string;
  status: ExamStatus;
  accessibilityLabel: string;
  onPress?: () => void;
};

/** Final del camino del temario: examen del nivel. */
export function ExamNode({ title, caption, status, accessibilityLabel, onPress }: ExamNodeProps) {
  return (
    <Tappable
      onPress={onPress}
      disabled={status === 'locked'}
      accessibilityLabel={accessibilityLabel}
    >
      <Column gap="sm">
        <Row justify="center">
          <IconBox icon="certificate-outline" size="xl" {...examIcon[status]} />
        </Row>
        <Column align="center">
          <AppText tone="streak" weight="bold" align="center">
            {title}
          </AppText>
          <AppText variant="caption" align="center">
            {caption}
          </AppText>
        </Column>
      </Column>
    </Tappable>
  );
}
