const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Migraciones de Drizzle (.sql) incluidas en el bundle
config.resolver.sourceExts.push('sql');

// Web: expo-sqlite trae SQLite compilado a WebAssembly (la app web usa sql.js, pero el módulo se resuelve igual)
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './src/global.css' });
