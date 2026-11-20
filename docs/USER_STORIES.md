# Historias de usuario — CONTAITSCCH v2

Actualizadas con los cambios del cliente (16 de noviembre de 2026): 6 niveles × 4 temas, ejercicio por
tema, examen integrador, glosario y ranking por avance. Ya no hay XP, rachas ni vidas. Diseño de
referencia: `spec/contaitscch-refactor/index.html`. Pendiente de validar con el cliente.

## Registro de usuario

Como administrador de la aplicación móvil, Quiero que los usuarios de mi aplicación se registren, Para llevar un control de quienes están utilizando la aplicación.

Especificaciones:

- La aplicación debe pedir el nombre del usuario
  - Mínimo 3 caracteres
- La aplicación debe pedir los apellidos del usuario
  - Mínimo 3 caracteres
- La aplicación debe pedir el correo electrónico
  - Mínimo 3 caracteres
  - Validar que tenga un @ para ser válido
- La aplicación debe pedir una contraseña
  - Mínimo 6 caracteres
- La aplicación debe pedir la dirección básica:
  - País (requerido)
  - Estado (requerido)
  - Ciudad (opcional)

## Verificar correo electrónico (opcional, apagada por ahora)

> Mientras no haya proveedor de correo, el registro entra directo al curso. Se enciende desde el
> servidor sin publicar otra versión de la app.

Como usuario de la aplicación móvil, Quiero poder verificar mi correo electrónico, Para poder acceder a la aplicación.

Especificaciones:

- La aplicación debe mandar un correo electrónico con un código de verificación de 6 dígitos
- La aplicación debe pedir el código que fue enviado al correo
- La aplicación debe validar el código (vence en 10 minutos; máximo 5 intentos; reenvío cada 45 segundos)
- La aplicación debe mandar a la pantalla inicial sin necesidad de iniciar sesión de nuevo

## Iniciar sesión

Como usuario registrado, Quiero iniciar sesión con mi correo y contraseña, Para continuar mi avance en este u otro teléfono.

Especificaciones:

- La aplicación debe pedir el correo y la contraseña
- Si los datos son incorrectos, debe mostrar un mensaje genérico (sin decir si el correo existe)
- Al entrar, la aplicación debe recuperar el avance guardado en la nube
- La sesión se queda abierta aunque no haya internet; se cierra desde Perfil

## Inicio (Niveles)

Como usuario de la aplicación móvil, Quiero ver un inicio con las opciones principales, Para saber a dónde dirigirme o qué hacer primero.

Especificaciones:

- La aplicación debe mostrar el logotipo y un saludo con el nombre del usuario.
- La aplicación debe mostrar el nivel actual, el avance general y un botón para continuar con el siguiente tema.
- La aplicación debe mostrar las tarjetas de los 6 niveles.
- La aplicación debe mostrar un tip de contabilidad.
- La aplicación debe dar acceso a Aprender, Glosario, Ranking y Perfil desde la barra de pestañas.

## Niveles de contabilidad

Como usuario de la aplicación móvil, Quiero ver los 6 niveles de contabilidad, Para ir tomando el curso por niveles.

Especificaciones:

- La aplicación debe mostrar los 6 niveles con su título y su meta.
- Un nivel queda bloqueado mientras no se apruebe el último tema del nivel anterior.
- La aplicación debe mostrar el avance de cada nivel (temas aprobados de 4) y marcar como completado el nivel con sus 4 temas aprobados.

## Temario del nivel (ruta de temas)

Como usuario de la aplicación móvil, Quiero ver los temas del nivel en el que voy, Para saber qué tema tomar.

Especificaciones:

- La aplicación debe mostrar los 4 temas del nivel en una ruta, con pestañas para cambiar de nivel.
- Los temas se desbloquean en orden: un tema se abre al aprobar el anterior, aunque sea de otro nivel.
- Cada tema muestra su estado: aprobado, actual, por aprobar (ya lo intentó sin aprobar) o bloqueado.
- La aplicación debe mostrar el avance del nivel y un botón para continuar.

## Desarrollo de un tema

Como usuario de la aplicación móvil, Quiero poder tomar los temas del temario, Para aprender y reforzar mis conocimientos.

Especificaciones:

- Cada tema se presenta en 4 pasos: objetivo con infografía, explicación, ejemplo resuelto y repaso (idea clave, error común y actividad).
- La aplicación debe mostrar el progreso dentro del tema (paso N de 4).
- Al terminar los pasos, la aplicación lleva al ejercicio del tema.

## Ejercicio de cada tema

Como usuario de la aplicación móvil, Quiero resolver un ejercicio al final de cada tema, Para comprobar lo que aprendí y desbloquear el siguiente tema.

Especificaciones:

- El ejercicio tiene preguntas de opción múltiple (2 a 4 opciones, una correcta).
- Se aprueba respondiendo bien todas las preguntas.
- Al comprobar, la aplicación solo marca si la opción elegida es correcta o no; nunca revela la correcta.
- La retroalimentación se muestra solo al acertar.
- La aplicación debe mostrar una barra de progreso (por ejemplo, pregunta 1 de 4).
- Si no aprueba, el tema queda "por aprobar" y puede volver a tomar la lección y el ejercicio.
- Un tema aprobado nunca se pierde, aunque después repruebe el ejercicio.

## Examen integrador

Como usuario de la aplicación móvil, Quiero presentar un examen final, Para demostrar que domino todo el curso.

Especificaciones:

- Se habilita al aprobar los 24 temas.
- Tiene 10 preguntas de opción múltiple y se aprueba con 8 aciertos.
- No muestra retroalimentación ni la respuesta correcta.
- Al terminar, muestra el resultado (aprobado o por aprobar) y permite reintentar.

## Glosario

Como usuario de la aplicación móvil, Quiero consultar un glosario de términos contables, Para repasar conceptos cuando los necesite.

Especificaciones:

- La aplicación debe mostrar los términos en orden alfabético con su definición.
- La aplicación debe permitir buscar un término (sin importar acentos ni mayúsculas).
- Funciona sin internet.

## Introducción a la app (Conoce CONTAITSCCH)

Como usuario de la aplicación móvil, Quiero ver una introducción de la aplicación, Para conocerla más a fondo y saber si confiar en ella.

Especificaciones:

- La aplicación debe mostrar una breve descripción de lo que trata la aplicación.
- La aplicación debe mostrar los objetivos de la aplicación y cómo funciona el curso.
- La aplicación debe mostrar la institución (ITSCCH · Instituto Tecnológico Superior de la Costa Chica) y el equipo que colabora en el proyecto:
  - Alumnos
  - Profesores
  - Asesores

## Ranking de participantes

Como usuario de la aplicación móvil, Quiero ver quiénes más están registrados y cómo van, Para ver si encuentro a amigos en la app.

Especificaciones:

- La aplicación debe mostrar una lista de los participantes (solo con correo verificado cuando la verificación esté encendida).
- Por cada participante debe mostrar:
  - Posición
  - Nombre completo
  - Niveles completados
  - Temas aprobados
- El orden es por niveles completados y luego por temas aprobados; quienes empatan comparten posición.
- La aplicación debe mostrar los 3 primeros lugares en un podio.
- La aplicación debe mostrar en qué posición estás.
- Nunca muestra correos.
- Sin internet, muestra el último ranking descargado con "Ranking de hace X".

## Sincronización del avance

Como usuario de la aplicación móvil, Quiero que mi avance se guarde en la nube, Para continuar en otro teléfono donde me quedé.

Especificaciones:

- El curso funciona sin internet; el avance se sube al terminar cada ejercicio, al abrir la app, al volver a ella y al recuperar la conexión.
- La aplicación debe mostrar si el avance está sincronizado, pendiente (con el número de cambios), sin conexión o con error.
- El Perfil debe tener un botón "Sincronizar ahora".
- Si se usa la misma cuenta en dos teléfonos, el avance se combina: lo aprobado en cualquiera de ellos queda aprobado.

## Perfil y reiniciar avance

Como usuario de la aplicación móvil, Quiero ver mi perfil y poder reiniciar mi avance, Para empezar el curso de nuevo si lo necesito.

Especificaciones:

- El Perfil muestra nombre, correo, ubicación, avance por nivel y el estado de sincronización.
- "Reiniciar mi avance" pide confirmación y necesita internet: borra el avance en la nube y en el teléfono.
- Un teléfono con el avance anterior no puede volver a subirlo después del reinicio.
- El Perfil permite cerrar sesión e ir a "Conoce CONTAITSCCH".
