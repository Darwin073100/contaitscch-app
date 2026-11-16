// Frases y tips contables de la tarjeta del inicio (del prototipo del cliente). Son textos de la app,
// no contenido del curso: no van a SQLite.

export type Tip = { kind: 'Frase' | 'Tip contable'; text: string; detail: string };

export const tips: Tip[] = [
  {
    kind: 'Frase',
    text: 'La contabilidad es el lenguaje de los negocios.',
    detail: 'Si sabes leerla, entiendes cómo está cualquier empresa por dentro.',
  },
  {
    kind: 'Tip contable',
    text: 'Activo = Pasivo + Capital: si no cuadra, algo falta por registrar.',
    detail: 'Usa la ecuación contable como tu primera revisión de cada ejercicio.',
  },
  {
    kind: 'Frase',
    text: 'Un negocio sin registros navega a ciegas.',
    detail: 'Registrar hoy es poder decidir mañana con números, no con corazonadas.',
  },
  {
    kind: 'Tip contable',
    text: 'Antes de registrar, pregúntate: ¿qué entró, qué salió y de dónde salió el dinero?',
    detail: 'Esas tres respuestas te dan las cuentas del asiento contable.',
  },
  {
    kind: 'Frase',
    text: 'Todo cargo tiene su abono.',
    detail: 'La partida doble: cada movimiento toca por lo menos dos cuentas.',
  },
  {
    kind: 'Tip contable',
    text: 'Separa siempre el dinero del negocio del dinero personal.',
    detail: 'Mezclarlos es el error más común al empezar, y el más difícil de deshacer.',
  },
  {
    kind: 'Tip contable',
    text: 'Guarda cada factura y ticket el mismo día.',
    detail: 'Registrar de memoria es registrar con error: el comprobante es tu respaldo.',
  },
  {
    kind: 'Frase',
    text: 'La caja dice cuánto tienes; el estado de resultados, si ganaste.',
    detail: 'Son dos preguntas distintas, y necesitas las dos respuestas.',
  },
  {
    kind: 'Tip contable',
    text: 'Revisa tu balanza de comprobación con frecuencia.',
    detail:
      'La suma de cargos debe ser igual a la suma de abonos; si no, busca el asiento descuadrado.',
  },
  {
    kind: 'Frase',
    text: 'Vender mucho no es lo mismo que ganar mucho.',
    detail: 'A las ventas todavía hay que restarles costos y gastos para conocer la utilidad.',
  },
  {
    kind: 'Tip contable',
    text: 'Registra el IVA por separado desde el inicio.',
    detail: 'El IVA no es un ingreso: es un impuesto que trasladas y luego enteras al SAT.',
  },
  {
    kind: 'Frase',
    text: 'El balance es la foto; el estado de resultados, la película.',
    detail: 'Uno muestra cómo estás en un momento; el otro, cómo te fue en el periodo.',
  },
  {
    kind: 'Tip contable',
    text: 'Cuida el flujo de efectivo: puedes tener utilidades y quedarte sin dinero.',
    detail: 'La utilidad se registra al vender; el dinero entra cuando cobras.',
  },
  {
    kind: 'Frase',
    text: 'Cada peso que entra o sale deja una huella.',
    detail: 'El asiento contable es esa huella, escrita en el debe y el haber.',
  },
  {
    kind: 'Tip contable',
    text: 'Concilia bancos con libros al cerrar el mes.',
    detail: 'Comparar el estado de cuenta con tus registros evita sorpresas y errores arrastrados.',
  },
  {
    kind: 'Frase',
    text: 'Saber cuánto debes es tan importante como saber cuánto tienes.',
    detail: 'El pasivo también es información: ignorarlo no lo hace desaparecer.',
  },
  {
    kind: 'Tip contable',
    text: 'Si el inventario no cuadra, revisa entradas y salidas antes de ajustar.',
    detail: 'Ajustar sin buscar el error esconde robos, mermas y registros duplicados.',
  },
  {
    kind: 'Frase',
    text: 'El debe y el haber no son bueno ni malo.',
    detail: 'Son simplemente los dos lados de la misma historia contable.',
  },
];
