import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { IconButton } from './IconButton';

type FigureProps = {
  source: ImageSourcePropType;
  /** Texto alternativo: describe la imagen para lectores de pantalla. */
  alt: string;
};

/** Imagen 3:2 (infografía del tema) que se amplía a pantalla completa al tocarla. */
export function Figure({ source, alt }: FigureProps) {
  const [zoomed, setZoomed] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        onPress={() => setZoomed(true)}
        accessibilityRole="imagebutton"
        accessibilityLabel={`${alt}. Toca para ampliar`}
        className="overflow-hidden rounded-[20px] border border-line bg-surface active:opacity-90"
      >
        <Image source={source} className="aspect-[3/2] w-full" resizeMode="cover" />
        <View className="absolute bottom-2.5 right-2.5 flex-row items-center gap-1.5 rounded-full bg-navy px-3 py-1.5">
          <Icon name="magnify-plus-outline" color="navy-ink" size="sm" />
          <Text className="font-display text-[13px] text-navy-ink">Ampliar</Text>
        </View>
      </Pressable>

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
            contentContainerClassName="flex-grow justify-center"
          >
            <Image
              source={source}
              className="aspect-[3/2] w-full rounded-2xl"
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
