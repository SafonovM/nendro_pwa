/**
 * Накопление мантр для сангхи.
 * Лист: A=Практика, B=Накоплено, C=Активно
 *
 * GET                → список активных практик
 * GET ?action=add&practice=...&add=108 → плюсует число (нужно для PWA / CORS)
 * POST JSON { practice, add } → то же самое
 */

var SHEET_NAME = 'Лист1'; // поменяйте, если лист переименован

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (String(params.action || '') === 'add') {
      return handleAdd_(params.practice, Number(params.add));
    }

    var sheet = getSheet_();
    return json_({
      ok: true,
      practices: listActivePractices_(sheet),
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    return handleAdd_(body.practice, Number(body.add));
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function handleAdd_(practiceRaw, add) {
  var practiceName = String(practiceRaw || '').trim();
  if (!practiceName) {
    return json_({ ok: false, error: 'Не указана практика (practice)' });
  }
  if (!isFinite(add) || add <= 0 || Math.floor(add) !== add) {
    return json_({ ok: false, error: 'add должен быть целым числом > 0' });
  }

  var sheet = getSheet_();
  var row = findPracticeRow_(sheet, practiceName);
  if (!row) {
    return json_({ ok: false, error: 'Практика не найдена: ' + practiceName });
  }

  var active = normalizeActive_(sheet.getRange(row, 3).getValue());
  if (!active) {
    return json_({ ok: false, error: 'Практика неактивна: ' + practiceName });
  }

  var current = Number(sheet.getRange(row, 2).getValue());
  if (!isFinite(current)) current = 0;

  var next = current + add;
  sheet.getRange(row, 2).setValue(next);

  return json_({
    ok: true,
    practice: practiceName,
    previous: current,
    added: add,
    total: next,
  });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Лист не найден: ' + SHEET_NAME);
  }
  return sheet;
}

function listActivePractices_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var out = [];

  for (var i = 0; i < values.length; i++) {
    var name = String(values[i][0] || '').trim();
    if (!name) continue;
    if (!normalizeActive_(values[i][2])) continue;

    var total = Number(values[i][1]);
    if (!isFinite(total)) total = 0;

    out.push({
      practice: name,
      total: total,
      row: i + 2,
    });
  }
  return out;
}

function findPracticeRow_(sheet, practiceName) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var names = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var needle = practiceName.toLowerCase();

  for (var i = 0; i < names.length; i++) {
    var name = String(names[i][0] || '').trim();
    if (name.toLowerCase() === needle) {
      return i + 2;
    }
  }
  return null;
}

function normalizeActive_(value) {
  var v = String(value == null ? '' : value).trim().toLowerCase();
  return (
    v === 'да' ||
    v === 'yes' ||
    v === 'true' ||
    v === '1' ||
    v === 'y' ||
    v === 'активно'
  );
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
