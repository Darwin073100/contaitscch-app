/* global jest */
// NetInfo es un módulo nativo: se usa el mock que trae el paquete.
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

// Los iconos cargan su fuente con expo-asset, que no existe en Jest: se reemplazan por un nodo vacío.
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  function MockIcon() {
    return null;
  }
  return MockIcon;
});
