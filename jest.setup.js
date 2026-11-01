/* global jest */
// Los iconos cargan su fuente con expo-asset, que no existe en Jest: se reemplazan por un nodo vacío.
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  function MockIcon() {
    return null;
  }
  return MockIcon;
});
