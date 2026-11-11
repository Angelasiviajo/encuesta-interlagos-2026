# Encuesta Interlagos 2026 · Sí Viajo Sports

Encuesta post viaje en un solo HTML (pasajeros + debrief de coordinadores). Las respuestas se guardan en una Google Sheet mediante Google Apps Script.

## Archivos

- `index.html`: la encuesta. HTML, CSS y JS en un solo archivo, sin dependencias (solo Google Fonts).
- `Code.gs`: script que recibe las respuestas y las escribe en la Sheet.

## Puesta en marcha (10 minutos)

1. **Crear la Sheet.** Crear una Google Sheet nueva, por ejemplo "Encuesta Interlagos 2026 – Respuestas".
2. **Pegar el script.** En la Sheet ir a *Extensiones → Apps Script*, borrar lo que haya y pegar el contenido de `Code.gs`. Guardar.
3. **Publicar como Web App.** *Implementar → Nueva implementación → Tipo: Aplicación web*.
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
   - Autorizar los permisos que pide Google.
   - Copiar la URL que termina en `/exec`.
4. **Probar la URL.** Abrirla en el navegador: tiene que decir "Encuesta Interlagos 2026: OK".
5. **Conectar el HTML.** En `index.html`, al principio del `<script>`, reemplazar:
   ```js
   const SCRIPT_URL = 'PEGAR_ACA_LA_URL_DE_APPS_SCRIPT';
   ```
   por la URL `/exec`.
6. **Subir el HTML** al hosting / web de Sí Viajo (por ejemplo `siviajo.com/encuesta-interlagos`). Funciona en cualquier hosting estático.
7. **Probar un envío** completo y verificar que aparezca la fila en la Sheet.

## Cómo funciona

- Al tocar *Enviar*, el JS arma un objeto `{ survey, sentAt, answers }` y hace un `POST` (`text/plain`, `mode: 'no-cors'`) a la Web App. Se usa `text/plain` para evitar el preflight de CORS de Apps Script.
- `survey` vale `pasajeros` o `coordinadores`. Cada uno se guarda en su propia pestaña de la Sheet (se crean solas).
- Cada pregunta es una columna (`"03. Vuelo charter | Puntualidad del vuelo de ida"`) y su comentario opcional va en la columna siguiente (`… – comentario`). Los encabezados se crean con el primer envío; si se agrega una pregunta nueva, la columna se suma sola al final.
- Las opciones múltiples se guardan separadas por coma.
- Con `no-cors` el navegador no puede leer la respuesta del servidor, así que la pantalla de gracias se muestra siempre. Verificar en la Sheet.

## Links directos

- Encuesta de pasajeros: `…/encuesta-interlagos-2026/#pasajeros`
- Debrief de coordinadores: `…/encuesta-interlagos-2026/#coordinadores`

Para que los pasajeros no vean la pestaña de coordinadores, se puede ocultar el bloque `.tabs` o publicar dos copias del HTML.

## Editar preguntas

Todas las preguntas están en el objeto `SURVEYS` del `<script>`. Tipos disponibles: `scale` (1 a 5), `nps` (0 a 10), `choice` (una opción), `multi` (varias), `text` (abierta larga) y `short` (abierta corta). Las preguntas de escala u opción llevan automáticamente un campo de comentario opcional.

**Importante:** si se cambia el texto de una pregunta después de empezar a recibir respuestas, se crea una columna nueva en la Sheet. Conviene cerrar las preguntas antes de mandar la encuesta.
