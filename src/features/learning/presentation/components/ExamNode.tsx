import {
  AppText,
  Column,
  IconBox,
  Row,
  Tappable,
  type IconBoxProps,
  type IconName,
} from '@/shared/ui';

import type { ExamStatus } from '../../domain/entities/Syllabus';

/** Distancia del borde superior al centro del icono (IconBox xl = 80 px). */
export const EXAM_NODE_ANCHOR = 40;
export const EXAM_NODE_WIDTH = 200;

const examIcon: Record<ExamStatus, Pick<IconBoxProps, 'tone' | 'cornerIcon'>> = {
  locked: { tone: 'locked', cornerIcon: 'lock' },
  available: { tone: 'navy' },
  passed: { tone: 'navy' },
};

type ExamNodeProps = {
  title: string;
  caption: string;
  status: ExamStatus;
  /** Bandera (fin de nivel) o medalla (examen integrador). */
  icon: IconName;
  accessibilityLabel: string;
  onPress?: () => void;
};

/** Meta al final de la ruta: abre el siguiente nivel o el examen integrador. */
export function ExamNode({
  title,
  caption,
  status,
  icon,
  accessibilityLabel,
  onPress,
}: ExamNodeProps) {
  return (
    <Tappable
      onPress={onPress}
      disabled={status === 'locked'}
      accessibilityLabel={accessibilityLabel}
    >
      <Column gap="sm">
        <Row justify="center">
          <IconBox icon={icon} size="xl" {...examIcon[status]} />
        </Row>
        <Column align="center">
          <AppText weight="extrabold" align="center">
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
