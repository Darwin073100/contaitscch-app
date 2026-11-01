module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    // Drizzle importa las migraciones .sql como texto
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
