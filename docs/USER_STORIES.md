## Registro de usuario

Como administrador de la aplicación móvil, Quiero que los usuarios de mi aplicación se registren, Para llevar un control de quienes están utilizando la aplicación.

Especificaciones:

- La aplicación debe pedir el nombre del usuario
    - Mínimo 3 caracteres
- La aplicación debe pedir los apellidos del usuario
    - Mínimo 3 caracteres
- La aplicación debe pedir el correo electrónico
    - Mínimo 3 caracteres
    - Validar que tenga un @ para ser valido
- La aplicación debe pedir una contraseña
    - Mínimo 6 caracteres
- La aplicación debe pedir la dirección básica:
    - País(Requerido)
    - Estado(Requerido)
    - Ciudad(Opcional)

## Verificar correo electrónico

Como usuario de la aplicación móvil, Quiero poder verificar mi correo electrónico, Para poder acceder a la aplicación.

Especificaciones:

- La aplicación debe pedir el correo electrónico
- La aplicación debe mandar un mensaje correo electrónico con un código de verificación
- La aplicación debe pedir el código que fue enviado al correo
- La aplicación debe validar el código
- La aplicación debe mandar a la pantalla inicial sin necesidad de loguearse de nuevo

## Menú de inicio

Como usuario de la aplicación móvil, Quiero ver un menú inicial de las opciones principales de la aplicación, Para saber a donde dirigirme o saber que es lo que quiero hacer primero.

Especificaciones: 

- La aplicación debe mostrar el Logotipo en el inicio.
- La aplicación debe mostrar una opción para ir a ver los niveles de contabilidad, Básico, Intermedio y Avanzado.
- La aplicación debe mostrar una opción para ver los participantes con los que cuenta la aplicación.
- La aplicación debe mostrar una opción para configuraciones avanzadas.

## Niveles de contabilidad

Como usuario de la aplicación mocil, Quiero ver los niveles de contabilidad, Básico, Intermedio y Avanzado, Para ir tomando los cursos por niveles.

Especificaciones:

- La aplicación debe mostrar los niveles, si  no se ha aprobado los niveles no se puede avanzar.
- La aplicación debe mostrar la opción para ir al nivel Básico
- La aplicación debe mostrar la opción para ir al nivel Intermedio
- La aplicación debe mostrar la opción para ir al nivel Avanzado
- La aplicación debe mostrar una barra de progreso, dependiendo de que nivel vaya, si se aprobó el test del nivel Básico, mostrar como completado. Si el nivel Intermedio esta en proceso, mostrar en la barra el progreso que lleva.

## Temario del nivel <Básico, Intermedio, Avanzado>

Como usuario de la aplicación móvil, Quiero ver el temario del nivel en el que voy, Para saber que tema del temario tomar.

Especificaciones:

- La aplicación debe mostrar los temas que se abordaran en dicho nivel.
- La aplicación debe bloquear los temas si el anterior no se ha concluido.
- La aplicación debe mostrar una barra de progreso, para saber el avance.

## Desarrollo de un tema

Como usuario de la aplicación móvil, Quiero poder tomar los temas que vienen en el temario, Para aprender y reforzar mis conocimientos.

Especificaciones:

- La aplicación debe mostrar el contenido del tema de manera intuitiva.
- La aplicación debe marcar como completado el tema en el temario para actualizar la barra de progreso.
- La aplicación debe mostrar gráficos atractivos para llamar la atención del usuario.
- La aplicación debe ir mostrando un progreso sobre el tema que se está mostrando.

## Examen de cada modulo(Nivel)

Como usuario de la aplicación móvil, Quiero poder realizar un examen sobre cada nivel, Para poner a prueba mis conocimientos poder desbloquear el siguiente nivel.

Especificaciones:

- La aplicación debe mostrar de forma interactiva una prueba de conocimientos.
- La aplicación debe mostrar diferentes tipos de pruebas:
    - Opción múltiple
    - Complementarias
- La aplicación debe mostrar una barra de progreso para ver lo que falta del examen
    - Por ejemplo 7/10, 7 preguntas de 10.

## Introducción a la app

Como usuario de la aplicación móvil, Quiero poder ver una introducción de la aplicación, Para conocer mas a fondo y saber si confiar en esta app.

Especificaciones:

- La aplicación debe mostrar una breve descripción de lo que trata la aplicación.
- La aplicación debe mostrar los objetivos de la aplicación
- La aplicación debe mostrar el equipo que colabora en el proyecto
    - Alumnos
    - Profesores
    - Asesores
    - Etc.

## Usuarios

Como usuario de la aplicación móvil, Quiero poder ver quienes mas están registrados, Para ver si encuentro a amigos en la app.

Especificaciones:

- La aplicación debe mostrar una lista de los participantes en la aplicación.
- La aplicación debe mostrar por cada item:
    - Posición
    - Nombre completo
    - XP(Puntos obtenidos)
    - Días de racha que lleva
    
    - Nivel en el que se encuentran(Básico, Intermedio, Avanzado)
- La aplicación debe mostrar los 3 primeros lugares.
- La aplicación debe mostrar en que posición estas de la lista.
