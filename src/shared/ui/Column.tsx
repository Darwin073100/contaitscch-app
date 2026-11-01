import { View, type ViewProps } from 'react-native';

import { layout, type LayoutVariants } from './layout';

type ColumnProps = Omit<ViewProps, 'className'> & LayoutVariants;

/** Columna vertical con separación uniforme entre hijos. */
export function Column({ gap, align, justify, grow, wrap, ...props }: ColumnProps) {
  return (
    <View className={layout({ direction: 'column', gap, align, justify, grow, wrap })} {...props} />
  );
}
