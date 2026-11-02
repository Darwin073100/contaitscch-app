import type { TopicContent } from '@/core/database/seed/contentSchema';

// Temporal: contenido del tema 4 del nivel Básico con el mismo formato que los JSON del curso
// (se valida con TopicSchema en su prueba). El paso 2 es el de docs/design/desarrollo-del-tema.png.
// Cuando exista basico.json, este objeto se mueve ahí y se borra este archivo (spec 06).
export const previewTopicContents: TopicContent[] = [
  {
    id: 104,
    title: 'Cuentas T (Esquemas de Mayor)',
    sortOrder: 4,
    subtopics: [
      {
        id: 10401,
        title: '¿Qué es una cuenta contable?',
        sortOrder: 1,
        blocks: [
          {
            type: 'paragraph',
            text: 'Una **cuenta** es el registro donde se anotan, en orden, los aumentos y disminuciones de un mismo concepto: **Caja**, **Bancos**, **Clientes**, **Proveedores** o **Capital Social**.',
          },
          {
            type: 'paragraph',
            text: 'Cada operación de la empresa afecta por lo menos **dos cuentas**, y el conjunto de todas ellas forma el **Libro Mayor**.',
          },
          {
            type: 'example',
            title: 'Ejemplo',
            text: 'Si la empresa deposita $5,000 del efectivo en el banco, **Bancos** aumenta y **Caja** disminuye: dos cuentas afectadas por la misma cantidad.',
          },
        ],
      },
      {
        id: 10402,
        title: '¿Qué es una Cuenta T y cómo funciona?',
        sortOrder: 2,
        blocks: [
          {
            type: 'paragraph',
            text: 'El esquema de mayor o **"Cuenta T"** es la herramienta gráfica fundamental para clasificar y registrar aumentos y disminuciones en la contabilidad.',
          },
          {
            type: 't_account',
            debit: {
              label: 'Lado Izquierdo • Cargos',
              items: ['+ Activo', '+ Gasto', '− Pasivo'],
            },
            credit: {
              label: 'Lado Derecho • Abonos',
              items: ['+ Pasivo', '+ Capital / Ingreso', '− Activo'],
            },
          },
          {
            type: 'callout',
            icon: 'scale',
            title: 'Regla de Oro de la Partida Doble',
            text: 'A todo cargo corresponde un abono equivalente. La suma del **DEBE** siempre debe coincidir con la del **HABER**.',
          },
        ],
      },
      {
        id: 10403,
        title: 'El saldo de una cuenta',
        sortOrder: 3,
        blocks: [
          {
            type: 'paragraph',
            text: 'El **saldo** es la diferencia entre la suma de los cargos (**movimientos deudores**) y la suma de los abonos (**movimientos acreedores**).',
          },
          {
            type: 'paragraph',
            text: 'Si los cargos son mayores, el saldo es **deudor**; si los abonos son mayores, es **acreedor**; si son iguales, la cuenta está **saldada**.',
          },
          {
            type: 'example',
            title: 'Ejemplo: cuenta de Caja',
            text: 'Saldo inicial $50,000 (cargo), venta al contado $12,000 (cargo) y pago de renta $8,000 (abono). Cargos $62,000 − abonos $8,000 = **saldo deudor de $54,000**.',
          },
          {
            type: 'callout',
            icon: 'lightbulb',
            title: 'Para recordar',
            text: 'Las cuentas de **Activo** suelen tener saldo deudor; las de **Pasivo** y **Capital**, saldo acreedor.',
          },
        ],
      },
      {
        id: 10404,
        title: 'Registra tu primera operación',
        sortOrder: 4,
        blocks: [
          {
            type: 'paragraph',
            text: 'La empresa compra mobiliario de oficina por **$15,000** y lo paga en efectivo. ¿Qué cuentas cambian y de qué lado se registran?',
          },
          {
            type: 't_account',
            debit: {
              label: 'Mobiliario y Equipo • Cargo',
              items: ['+ $15,000 por el mobiliario que entra'],
            },
            credit: {
              label: 'Caja • Abono',
              items: ['− $15,000 por el efectivo que sale'],
            },
          },
          {
            type: 'example',
            title: 'Comprobación',
            text: 'Cargos $15,000 = abonos $15,000. Un activo aumenta y otro disminuye por la misma cantidad: la **partida doble** se cumple.',
          },
        ],
      },
    ],
  },
];
