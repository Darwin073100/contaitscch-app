import { View, type ViewProps } from 'react-native';

import { layout, type LayoutVariants } from './layout';

type RowProps = Omit<ViewProps, 'className'> & LayoutVariants;

/** Fila horizontal. Por defecto centra verticalmente (como casi todas las filas del diseño). */
export function Row({ gap, align = 'center', justify, grow, wrap, ...props }: RowProps) {
  return (
    <View className={layout({ direction: 'row', gap, align, justify, grow, wrap })} {...props} />
  );
}
