import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

type TappableProps = Pick<
  PressableProps,
  'onPress' | 'disabled' | 'accessibilityLabel' | 'accessibilityHint' | 'testID'
> & {
  children: ReactNode;
};

/** Área táctil sin estilo propio para composiciones que no son Card ni Button (nodos del temario). */
export function Tappable({ disabled, children, ...props }: TappableProps) {
  return (
    <Pressable
      className="active:opacity-80"
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      {...props}
    >
      {children}
    </Pressable>
  );
}
