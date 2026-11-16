// Tokens de color del diseño (fuente única), en modo claro y oscuro. La app sigue al sistema.
// - tailwind.config.js los convierte en variables CSS (--color-<token>) y clases como bg-surface;
//   NativeWind cambia de paleta solo con el modo del teléfono.
// - Lo que no usa className (iconos, SVG, barra de pestañas) los lee con useThemeColors().
// Los "tint" del prototipo se escriben con opacidad de Tailwind: bg-accent/10, bg-amber/15…

const light = {
  bg: '#F6F7F9', // fondo
  surface: '#FFFFFF', // tarjetas
  'surface-alt': '#EEF2F5', // pills, barras vacías, candados
  'surface-sunk': '#FFFFFF', // campos de texto y casillas OTP
  line: '#DDE3E9', // bordes y separadores
  text: '#1A1A1A', // texto
  title: '#0F2A44', // títulos
  dim: '#5B6B7A', // texto secundario
  faint: '#8D9AA6', // placeholder y bloqueado
  accent: '#0E7C7B', // verde azulado: avanzar, aprobado, progreso
  'accent-ink': '#FFFFFF', // texto sobre accent
  'accent-rim': '#095756', // borde inferior de los botones accent
  'accent-soft': '#7FD1D0',
  navy: '#0F2A44', // marca: topbar, tarjetas destacadas
  'navy-ink': '#FFFFFF', // texto sobre navy
  'navy-dim': '#BCC3CB', // texto secundario sobre navy
  'navy-rim': '#071A2C',
  amber: '#F2A900', // tema actual, examen, podio, pendiente de sincronizar
  'amber-ink': '#0F2A44', // texto sobre amber
  'amber-rim': '#B97F00',
  'amber-text': '#8A5D00', // amber legible sobre fondos claros
  ok: '#2E7D32', // respuesta correcta
  'ok-ink': '#FFFFFF',
  err: '#C62828', // incorrecta, por aprobar, error de sincronización
  'err-ink': '#FFFFFF',
  bronze: '#A8581C', // 3.er lugar
};

const dark = {
  bg: '#0B1520',
  surface: '#122334',
  'surface-alt': '#1A2F45',
  'surface-sunk': '#0E1B2A',
  line: '#24405A',
  text: '#EEF3F7',
  title: '#EEF3F7',
  dim: '#9DB0C0',
  faint: '#6F879C',
  accent: '#2BA8A7',
  'accent-ink': '#062423',
  'accent-rim': '#1B7372',
  'accent-soft': '#7FD1D0',
  navy: '#0A1E33',
  'navy-ink': '#EEF3F7',
  'navy-dim': '#AAB3BC',
  'navy-rim': '#06121F',
  amber: '#F2A900',
  'amber-ink': '#0B1520',
  'amber-rim': '#A87400',
  'amber-text': '#F2C14E',
  ok: '#66BB6A',
  'ok-ink': '#0B1520',
  err: '#EF5350',
  'err-ink': '#0B1520',
  bronze: '#E39A62',
};

module.exports = { light, dark };
