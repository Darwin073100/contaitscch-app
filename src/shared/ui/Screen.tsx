import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tv, type VariantProps } from 'tailwind-variants';

const screen = tv({
  slots: {
    root: 'flex-1 bg-bg',
    header: 'px-4',
    body: 'flex-1 px-4',
    content: 'gap-6 px-4 pb-8 pt-2',
    footer: 'px-4 pb-3 pt-2',
  },
  variants: {
    align: {
      top: {},
      center: { body: 'items-center justify-center gap-2' },
    },
  },
  defaultVariants: { align: 'top' },
});

type ScreenProps = VariantProps<typeof screen> & {
  children: ReactNode;
  /** Barra fija arriba (AppHeader); no se desplaza con el contenido. */
  header?: ReactNode;
  /** Barra fija abajo: CTA del tema activo, "Tu posición", botones de paso. */
  footer?: ReactNode;
  /** Contenido desplazable con separación de 24 px entre secciones. */
  scroll?: boolean;
  /** Pantallas completas fuera de las pestañas: deja espacio para la barra del sistema. */
  safeBottom?: boolean;
  /** Formularios: el contenido se recorre para que el teclado no tape el campo activo. */
  keyboardAvoiding?: boolean;
};

export function Screen({
  align,
  children,
  header,
  footer,
  scroll = false,
  safeBottom = false,
  keyboardAvoiding = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const s = screen({ align });
  const bottomInset = safeBottom ? insets.bottom : 0;

  const content = (
    <>
      {scroll ? (
        <ScrollView
          contentContainerClassName={s.content()}
          contentContainerStyle={footer ? undefined : { paddingBottom: 32 + bottomInset }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className={s.body()} style={footer ? undefined : { paddingBottom: bottomInset }}>
          {children}
        </View>
      )}
      {footer && (
        <View className={s.footer()} style={{ paddingBottom: 12 + bottomInset }}>
          {footer}
        </View>
      )}
    </>
  );

  return (
    <View className={s.root()} style={{ paddingTop: insets.top }}>
      {header && <View className={s.header()}>{header}</View>}
      {keyboardAvoiding ? (
        // Guía de Expo: "padding" en iOS; en Android el sistema ya ajusta la ventana.
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}
