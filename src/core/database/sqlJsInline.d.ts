// sql.js con el wasm incluido en el JS (versión web): mismos tipos que el paquete principal.
declare module 'sql.js/dist/sql-wasm-inline.js' {
  import initSqlJs from 'sql.js';

  export default initSqlJs;
}
