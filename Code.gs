/**
 * Encuesta Interlagos 2026 · Sí Viajo Sports
 * Recibe las respuestas del HTML y las guarda en esta Google Sheet.
 * - Pestaña "Pasajeros" para la encuesta de pasajeros
 * - Pestaña "Coordinadores" para el debrief interno
 * Las columnas se crean solas con el primer envío.
 */

const SHEETS = {
  pasajeros: 'Pasajeros',
  coordinadores: 'Coordinadores'
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
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

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
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
