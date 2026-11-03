# MEMORY.md - Debt tracker

Memoria breve del proyecto, organizada por secciones.

## Estado actual

- v1.0.0 funcionando: registrar deudas con nombre, costo y fecha de vencimiento; listado ordenado por cercanía, edición y eliminación.
- Documentación lista: `README.md` en español, con captura en `docs/screenshot.png` (datos de ejemplo).
- Plantillas de GitHub para reportar errores y enviar sugerencias en `.github/ISSUE_TEMPLATE/`.
- Repositorio Git iniciado; `.gitignore` excluye archivos del sistema, editores, dependencias, builds, variables de entorno y logs.
- Los datos se guardan en `localStorage` (clave `"debts"`) como `{ id, name, cost, dueDate }`.

## Decisiones (y por qué)

- Sin backend ni dependencias: cualquiera puede abrir el proyecto sin instalar nada.
- Fecha obligatoria desde hoy; hoy es válido porque una deuda puede vencer ese mismo día.
- Cuenta exacta de días (sin `31+`): es más clara y útil.
- Orden de menos a más días restantes; las vencidas van primero y los empates respetan el orden de creación.
- Colores: rojo para vencida, naranja para cerca, gris para no tan cerca y verde para lejos. El texto siempre acompaña al color.
- Editar permite cambiar nombre, costo y fecha; eliminar pide confirmación.
- Licencia “todos los derechos reservados”: es un proyecto personal; se aceptan sugerencias, pero no se permite reutilizar o distribuir el código sin permiso.
- v2 planeada (cuentas de usuario) documentada como idea, no como función existente; requeriría backend, autenticación y base de datos.

## Lecciones aprendidas y errores a evitar

- No usar `new Date("YYYY-MM-DD")` porque se interpreta como UTC y puede desfasar un día; comparar con `Date.UTC`.
- Recalcular la fecha mínima al enfocar y al guardar, por si la página sigue abierta después de medianoche.
- El servidor de desarrollo no envía cabeceras anti-caché: si un cambio no aparece, hacer recarga forzada y subir el `?v=` de los archivos.
- Para regenerar la captura se usó Playwright fuera del proyecto; en Ubuntu faltaban `libnspr4`, `libnss3` y `libasound2`, que se extrajeron en `/tmp/opencode/chrome-libs`.

## Próximos pasos

- (Vacío por ahora).
