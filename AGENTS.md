# AGENTS.md

Rastreador de deudas estático hecho con HTML, CSS y JavaScript puro. Sin build, dependencias, tests ni linters.

## Estructura y ejecución

- `index.html` está en la raíz del repositorio; los estilos están en `css/styles.css`; todo el comportamiento está en `js/app.js`.
- Se ejecuta abriendo `index.html` directamente, o sirviendo la raíz del repositorio con `python3 -m http.server 8000`.
- `localStorage` está ligado al origen y al puerto, así que usa la misma URL/puerto al verificar la persistencia.

## Reglas del proyecto

- No agregar frameworks, librerías, CDNs ni pasos de build/herramientas.
- Mantener el código fácil para principiantes: funciones pequeñas con nombres claros, JS puro y comentarios simples en español. Todo el texto visible para el usuario está en español.
- Nunca cambiar la clave de `localStorage` `"debts"`. Los elementos guardados son `{ id, name, cost, dueDate }`, donde `cost` es un número y `dueDate` es `"YYYY-MM-DD"`.
- `js/app.js` depende de estos IDs exactos en `index.html`: `debt-form`, `debt-name`, `debt-cost`, `debt-date`, `debt-name-error`, `debt-cost-error`, `debt-date-error`, `submit-button`, `cancel-edit-button`, `debt-list`, `empty-message`, `total`. Actualiza ambos archivos juntos.
- Reglas de validación: el nombre de la deuda (sin espacios al inicio/final) debe tener al menos 4 caracteres; el costo debe ser de al menos 1000; la fecha es obligatoria y debe ser hoy o posterior.
- El campo del costo agrega los puntos de miles automáticamente con `toLocaleString("es-CO")`; quita los puntos antes de convertirlo de nuevo a número.
- El listado se ordena por días restantes de menor a mayor (vencidas primero); si hay empate, por orden de creación. Estados: Vencida (<0), Cerca (0–7), No tan cerca (8–30), Lejos (31+), con cuenta exacta de días.

## Memoria

- Para empezar, leer `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualizarlo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenerlo corto (máximo 50 líneas): resumir o eliminar lo que no importe.
- Si algo se vuelve una regla permanente, proponer moverlo a `AGENTS.md` en lugar de dejarlo en la memoria.
- No guardar datos personales.

## Límites

- Siempre: respetar las reglas y las deudas actuales; cuando el usuario las actualice, deben guardarse sin problemas.
- Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- Preguntar antes de: crear archivos nuevos o cambiar el formato de los datos guardados.
- Nunca agregar: dependencias, frameworks ni pasos de build.

## Verificación

- No hay tests ni lint; probar abriendo `index.html` en el navegador. Al probar fechas, cubrir hoy, 7/8 días, 30/31 días y una fecha vencida.
- Si un cambio no aparece, hacer recarga forzada (`Ctrl+Shift+R`) y subir el `?v=` de `css/styles.css` y `js/app.js` en `index.html`; el servidor de desarrollo no envía cabeceras anti-caché.
- Para empezar desde cero: DevTools → Application → Local Storage → eliminar la clave `"debts"`.
