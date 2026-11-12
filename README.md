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

- Al tocar *Enviar*, el JS arma un objeto `{ survey, sentAt, nps, expect, answers }` y hace un `POST` (`text/plain`) a la Web App. Se usa `text/plain` para evitar el preflight de CORS de Apps Script.
- `survey` vale `pasajeros` o `coordinadores`. Cada uno se guarda en su propia pestaña de la Sheet (se crean solas).
- Cada pregunta es una columna (`"03. Vuelo charter | Puntualidad del vuelo de ida"`) y su comentario opcional va en la columna siguiente (`… – comentario`). Los encabezados se crean con el primer envío; si se agrega una pregunta nueva, la columna se suma sola al final.
- Las opciones múltiples se guardan separadas por coma.
- La página lee la respuesta del servidor (`{ ok, reviewUrl? }`) para decidir si muestra el botón de reseña.

## Lógica condicional

### Pregunta de Interlagos 2027

El último bloque de la encuesta de pasajeros se adapta según cómo viene respondiendo cada uno:

- **Insatisfecho** si pasa cualquiera de estas: NPS de 0 a 6, "¿Cumplimos lo que esperabas?" = "Quedó por debajo", o promedio de las escalas 1–5 respondidas menor a 3 (con al menos 3 respondidas). No se le pregunta por 2027 ni VIP: se le ofrece contacto personal.
- **Satisfecho** en cualquier otro caso: ve las preguntas de 2027 y VIP.

Umbrales en el `<script>`: `NPS_MIN_HAPPY` (7) y `AVG_MIN_HAPPY` (3).

### Pedido de reseña en Google (lo decide el servidor)

- La pregunta de NPS es **obligatoria**: no se puede avanzar ni enviar sin responderla.
- La página manda `nps` junto con las respuestas. `Code.gs` decide: **solo si es encuesta de pasajeros y NPS 9 o 10** devuelve `reviewUrl`.
- La página muestra el botón "Dejar mi reseña en Google" **solo si el servidor devolvió el link**. Pasivos (7–8), detractores (0–6) y encuestas sin terminar nunca lo ven.
- En la Sheet queda la columna **"Se ofreció reseña"** (Sí/No).
- Configurar en `Code.gs`: `REVIEW_URL` (link de reseña de Google de Sí Viajo). Umbral: `NPS_MIN_REVIEW` (9). Mientras `REVIEW_URL` no empiece con `https://`, no se le muestra el botón a nadie.
- Como la página necesita leer la respuesta del servidor, el `fetch` ya **no** usa `mode: 'no-cors'`. Las Web Apps de Apps Script permiten esto con `Content-Type: text/plain`. Si el envío falla, se muestra igual la pantalla de gracias, sin botón.

## Links directos

- Encuesta de pasajeros: `…/encuesta-interlagos-2026/#pasajeros`
- Debrief de coordinadores: `…/encuesta-interlagos-2026/#coordinadores`

Para que los pasajeros no vean la pestaña de coordinadores, se puede ocultar el bloque `.tabs` o publicar dos copias del HTML.

## Editar preguntas

Todas las preguntas están en el objeto `SURVEYS` del `<script>`. Tipos disponibles: `scale` (1 a 5), `nps` (0 a 10), `choice` (una opción), `multi` (varias), `text` (abierta larga) y `short` (abierta corta). Las preguntas de escala u opción llevan automáticamente un campo de comentario opcional.

**Importante:** si se cambia el texto de una pregunta después de empezar a recibir respuestas, se crea una columna nueva en la Sheet. Conviene cerrar las preguntas antes de mandar la encuesta.
