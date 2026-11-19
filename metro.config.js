const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Migraciones de Drizzle (.sql) incluidas en el bundle
config.resolver.sourceExts.push('sql');

// Web: expo-sqlite usa SQLite compilado a WebAssembly (solo lo pide el bundle web)
config.resolver.assetExts.push('wasm');

// Web: SQLite en el navegador necesita SharedArrayBuffer, que exige aislamiento de origen.
// "require-corp" (no "credentialless") porque Safari no soporta "credentialless".
// En producción los mismos encabezados van en public/_headers.
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return middleware(req, res, next);
};

module.exports = withNativeWind(config, { input: './src/global.css' });
