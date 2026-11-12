/**
 * Encuesta Interlagos 2026 · Sí Viajo Sports
 * Recibe las respuestas del HTML y las guarda en esta Google Sheet.
 * - Pestaña "Pasajeros" para la encuesta de pasajeros
 * - Pestaña "Coordinadores" para el debrief interno
 * Las columnas se crean solas con el primer envío.
 */

// Link de reseña de Google de Sí Viajo. Solo se devuelve a promotores (NPS 9 o 10).
const REVIEW_URL = 'PEGAR_ACA_EL_LINK_DE_RESENA_DE_GOOGLE';
const NPS_MIN_REVIEW = 9;
// Si alguna de las escalas 1 a 5 respondidas es menor a este número, no se ofrece reseña
// aunque el NPS sea 9 o 10.
const SCALE_MIN_REVIEW = 4;

const SHEETS = {
  pasajeros: 'Pasajeros',
  coordinadores: 'Coordinadores'
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    data.answers = data.answers || {};

    // Pedido de reseña: lo decide el servidor, no la página.
    // Solo encuesta de pasajeros, enviada completa, con NPS 9 o 10
    // y sin ningún puntaje menor a 4 en las escalas 1 a 5.
    const nps = (typeof data.nps === 'number') ? data.nps : null;
    const scales = Array.isArray(data.scales) ? data.scales.map(Number).filter(n => n >= 1 && n <= 5) : [];
    const lowScore = scales.some(n => n < SCALE_MIN_REVIEW);
    const offerReview = data.survey === 'pasajeros' && nps !== null && nps >= NPS_MIN_REVIEW
      && !lowScore && REVIEW_URL.indexOf('https://') === 0;
    if (data.survey === 'pasajeros') {
      data.answers['Se ofreció reseña'] = offerReview ? 'Sí' : 'No';
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const name = SHEETS[data.survey] || 'Otras';
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);

    const keys = ['Fecha', 'Encuesta'].concat(Object.keys(data.answers || {}));
    let headers = sh.getLastColumn()
      ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]
      : [];

    if (!headers.length) {
      headers = keys;
      sh.getRange(1, 1, 1, headers.length).setValues([headers])
        .setFontWeight('bold').setBackground('#FFD400');
      sh.setFrozenRows(1);
    } else {
      const missing = keys.filter(k => headers.indexOf(k) === -1);
      if (missing.length) {
        sh.getRange(1, headers.length + 1, 1, missing.length).setValues([missing])
          .setFontWeight('bold').setBackground('#FFD400');
        headers = headers.concat(missing);
      }
    }

    const row = headers.map(h => {
      if (h === 'Fecha') return new Date();
      if (h === 'Encuesta') return name;
      const v = data.answers[h];
      return v === undefined || v === null ? '' : v;
    });
    sh.appendRow(row);

    const out = { ok: true };
    if (offerReview) out.reviewUrl = REVIEW_URL;
    return ContentService.createTextOutput(JSON.stringify(out))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Para probar que la Web App responde abriendo la URL en el navegador
function doGet() {
  return ContentService.createTextOutput('Encuesta Interlagos 2026: OK');
}
