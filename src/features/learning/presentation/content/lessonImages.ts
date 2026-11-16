import type { ImageSourcePropType } from 'react-native';

// Infografía de cada tema (assets/images/lessons/n{nivel}l{tema}.webp), por id de tema.
// React Native solo empaqueta imágenes con require estático: un tema nuevo = su entrada aquí.
const lessonImages: Record<number, ImageSourcePropType> = {
  101: require('../../../../../assets/images/lessons/n1l1.webp'),
  102: require('../../../../../assets/images/lessons/n1l2.webp'),
  103: require('../../../../../assets/images/lessons/n1l3.webp'),
  104: require('../../../../../assets/images/lessons/n1l4.webp'),
  201: require('../../../../../assets/images/lessons/n2l1.webp'),
  202: require('../../../../../assets/images/lessons/n2l2.webp'),
  203: require('../../../../../assets/images/lessons/n2l3.webp'),
  204: require('../../../../../assets/images/lessons/n2l4.webp'),
  301: require('../../../../../assets/images/lessons/n3l1.webp'),
  302: require('../../../../../assets/images/lessons/n3l2.webp'),
  303: require('../../../../../assets/images/lessons/n3l3.webp'),
  304: require('../../../../../assets/images/lessons/n3l4.webp'),
  401: require('../../../../../assets/images/lessons/n4l1.webp'),
  402: require('../../../../../assets/images/lessons/n4l2.webp'),
  403: require('../../../../../assets/images/lessons/n4l3.webp'),
  404: require('../../../../../assets/images/lessons/n4l4.webp'),
  501: require('../../../../../assets/images/lessons/n5l1.webp'),
  502: require('../../../../../assets/images/lessons/n5l2.webp'),
  503: require('../../../../../assets/images/lessons/n5l3.webp'),
  504: require('../../../../../assets/images/lessons/n5l4.webp'),
  601: require('../../../../../assets/images/lessons/n6l1.webp'),
  602: require('../../../../../assets/images/lessons/n6l2.webp'),
  603: require('../../../../../assets/images/lessons/n6l3.webp'),
  604: require('../../../../../assets/images/lessons/n6l4.webp'),
};

/** Infografía del tema; null si el tema no tiene (un tema nuevo sin imagen todavía). */
export function lessonImage(topicId: number): ImageSourcePropType | null {
  return lessonImages[topicId] ?? null;
}
