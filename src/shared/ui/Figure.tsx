import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type ImageLoadEvent,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { IconButton } from './IconButton';

type FigureProps = {
  source: ImageSourcePropType;
  /** Texto alternativo: describe la imagen para lectores de pantalla. */
  alt: string;
};

const DEFAULT_ASPECT_RATIO = 3 / 2;
/** Margen lateral de la vista ampliada (px-4 a cada lado). */
const ZOOM_SIDE_PADDING = 16;
/** Borde del recuadro (`border`, 1 px por lado): la imagen va por dentro. */
const BOX_BORDER = 1;

/**
 * Proporción real de la imagen (ancho / alto); 3:2 si no se puede leer. En web (react-native-web)
 * `Image.resolveAssetSource` no existe: ahí se corrige con el tamaño que da `onLoad`.
 */
function aspectRatioOf(source: ImageSourcePropType): number {
  const asset =
    typeof Image.resolveAssetSource === 'function' ? Image.resolveAssetSource(source) : null;
  return asset?.width && asset.height ? asset.width / asset.height : DEFAULT_ASPECT_RATIO;
}

/** Proporción que reporta la imagen al cargar, o null si no la trae. */
function aspectRatioOnLoad(event: ImageLoadEvent): number | null {
  const { width, height } = event.nativeEvent.source ?? {};
  return width && height ? width / height : null;
}

/**
 * Infografía del tema, completa y sin recortes, que se amplía a pantalla completa al tocarla.
 *
 * La imagen recibe ancho y alto en números (medidos con `onLayout`), no con clases, porcentajes
 * ni `aspectRatio`: con esos, en Android la imagen se dibujaba a su tamaño natural
 * (1200×800 dp) y el recuadro solo mostraba la esquina superior izquierda.
 */
export function Figure({ source, alt }: FigureProps) {
  const [zoomed, setZoomed] = useState(false);
  const [boxWidth, setBoxWidth] = useState(0);
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const [loadedRatio, setLoadedRatio] = useState<number | null>(null);
  const ratio = loadedRatio ?? aspectRatioOf(source);

  const onImageLoad = (event: ImageLoadEvent) => {
    const real = aspectRatioOnLoad(event);
    if (real && Math.abs(real - ratio) > 0.001) setLoadedRatio(real);
  };

  const onBoxLayout = (event: LayoutChangeEvent) => {
    const width = Math.floor(event.nativeEvent.layout.width) - BOX_BORDER * 2;
    if (width > 0 && width !== boxWidth) setBoxWidth(width);
  };

  // Vista ampliada: todo el ancho disponible, sin pasar del alto de la pantalla.
  const zoomMaxWidth = window.width - ZOOM_SIDE_PADDING * 2;
  const zoomMaxHeight = window.height - insets.top - insets.bottom - 96;
  const zoomWidth = Math.min(zoomMaxWidth, zoomMaxHeight * ratio);

  return (
    <>
      <View onLayout={onBoxLayout}>
        <Pressable
          onPress={() => setZoomed(true)}
          accessibilityRole="imagebutton"
          accessibilityLabel={`${alt}. Toca para ampliar`}
          className="overflow-hidden rounded-[20px] border border-line bg-surface active:opacity-90"
        >
          {boxWidth > 0 && (
            <Image
              source={source}
              style={{ width: boxWidth, height: boxWidth / ratio }}
              resizeMode="contain"
              onLoad={onImageLoad}
            />
          )}
          <View className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1.5 rounded-full bg-navy px-3 py-1.5">
            <Icon name="magnify-plus-outline" color="navy-ink" size="sm" />
            <Text className="font-display text-[13px] text-navy-ink">Ampliar</Text>
          </View>
        </Pressable>
      </View>

      <Modal
        visible={zoomed}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setZoomed(false)}
      >
        <View
          className="flex-1 justify-center bg-navy-rim/95 px-4"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          {/* maximumZoomScale permite pellizcar para acercar (iOS) */}
          <ScrollView
            maximumZoomScale={3}
            centerContent
            contentContainerClassName="flex-grow items-center justify-center"
          >
            <Image
              source={source}
              style={{ width: zoomWidth, height: zoomWidth / ratio, borderRadius: 16 }}
              resizeMode="contain"
              accessibilityLabel={alt}
            />
          </ScrollView>
          <View className="absolute right-4" style={{ top: insets.top + 12 }}>
            <IconButton
              icon="close"
              variant="surface"
              accessibilityLabel="Cerrar imagen"
              onPress={() => setZoomed(false)}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
