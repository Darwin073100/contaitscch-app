const { light, dark } = require('./src/shared/theme/colors');

/** '#0E7C7B' → '14 124 123' (canales para rgb(var(--x) / alpha), así funcionan bg-accent/10). */
const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');

const variables = (palette) =>
  Object.fromEntries(
    Object.entries(palette).map(([token, hex]) => [`--color-${token}`, channels(hex)]),
  );

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Cada token es una variable CSS: NativeWind cambia de paleta con el modo del sistema
      colors: Object.fromEntries(
        Object.keys(light).map((token) => [token, `rgb(var(--color-${token}) / <alpha-value>)`]),
      ),
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        medium: ['PlusJakartaSans_500Medium'],
        semibold: ['PlusJakartaSans_600SemiBold'],
        display: ['PlusJakartaSans_700Bold'],
        extrabold: ['PlusJakartaSans_800ExtraBold'],
      },
    },
  },
  plugins: [
    // Variables de los dos modos generadas desde colors.js (fuente única de los colores)
    ({ addBase }) =>
      addBase({
        ':root': variables(light),
        '@media (prefers-color-scheme: dark)': { ':root': variables(dark) },
      }),
  ],
};
