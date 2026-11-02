import { Row } from '@/shared/ui';

import type { TAccountSide } from '../../domain/entities/TopicSession';
import { TAccountColumn } from './TAccountColumn';

type TAccountCardProps = {
  debit: TAccountSide;
  credit: TAccountSide;
};

/** Bloque `t_account`: DEBE a la izquierda y HABER a la derecha, con la misma altura. */
export function TAccountCard({ debit, credit }: TAccountCardProps) {
  return (
    <Row gap="sm" align="stretch">
      <TAccountColumn kind="debit" side={debit} />
      <TAccountColumn kind="credit" side={credit} />
    </Row>
  );
}
