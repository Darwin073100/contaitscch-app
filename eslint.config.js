// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

// Reglas de fronteras de la arquitectura (ver docs/ARCHITECTURE.md)
const otherFeatureInternals = {
  group: ['@/features/*/*'],
  message:
    'Importa otra feature solo por su index.ts (@/features/<nombre>). Dentro de la misma feature usa rutas relativas.',
};
const parentDataLayer = ['../data', '../data/*', '../../data', '../../data/*', '../../../data/*'];
const parentPresentationLayer = [
  '../presentation',
  '../presentation/*',
  '../../presentation',
  '../../presentation/*',
  '../../../presentation/*',
];

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'node_modules/*',
      'src/core/database/migrations/*',
      'supabase/*',
    ],
  },
  {
    files: ['src/features/*/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react-native',
                'expo',
                'expo-*',
                '@supabase/*',
                'drizzle-orm',
                'drizzle-orm/*',
                '@/core/database/*',
                '@/core/network/*',
              ],
              message: 'domain debe ser TypeScript puro.',
            },
            {
              group: [...parentDataLayer, ...parentPresentationLayer],
              message: 'domain no depende de data ni de presentation.',
            },
            otherFeatureInternals,
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/presentation/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@supabase/*',
                'expo-sqlite',
                'drizzle-orm',
                'drizzle-orm/*',
                '@/core/database/*',
                '@/core/network/*',
                ...parentDataLayer,
              ],
              message: 'presentation usa use cases inyectados, no datos directos.',
            },
            otherFeatureInternals,
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/data/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: parentPresentationLayer, message: 'data no conoce la UI.' },
            otherFeatureInternals,
          ],
        },
      ],
    },
  },
]);
