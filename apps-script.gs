const CONFIG = {
  SPREADSHEET_ID: '1u__xYWoWZpmrnquc-Fpk19WtpcrckxSd0-_G35NWxXQ',
  API_TOKEN: 'mhl-2026-admin',
  TIMEZONE: 'Asia/Bangkok'
};

const SHEETS = {
  ความเสียหายอื่นๆ: {
    name: 'ความเสียหายอื่นๆ',
    key: 'MI_ID',
    prefix: 'MI',
    headers: ['MI_ID', 'CustID', 'รายการ', 'มูลค่า', 'ช่าง', 'หมายเหตุ', 'รูปภาพ_1', 'รูปภาพ_2', 'รูปภาพ_3', 'วันที่ลงรายการ']
  },
  Customer: {
    name: 'Customer',
    key: 'CustID',
    prefix: 'CUST',
    headers: ['CustID', 'ชื่อลูกค้า', 'เพศ', 'เบอร์โทรศัพท์', 'ช่องทางติดต่อ', 'วันที่ลงรายการ']
  },
  Bookings: {
    name: 'Bookings',
    key: 'JobID',
    prefix: 'JOB',
    headers: [
      'JobID', 'CustID', 'พนง.ขาย', 'วันที่ติดตั้ง', 'เวลานัด', 'ประเภทลูกค้า',
      'รุ่นรถยนต์', 'ทะเบียนรถ', 'ป้าย', 'ยี่ห้อฟิล์ม', 'การติดตั้ง', 'ยอดขาย',
      'Pro_ID', 'หมายเหตุ', 'Warranty', 'Status', 'ColorStatus'
    ]
  }
};

function doGet(e) {
  try {
    const params = e.parameter || {};
    verifyToken(params.token);

    if (params.action === 'health') {
      return jsonResponse({ ok: true, message: 'CAR CRM backend ready' }, params.callback);
    }

    if (params.action === 'list') {
      const config = getSheetConfig(params.sheet);
      return jsonResponse({ ok: true, rows: listRows(config) }, params.callback);
    }

    if (params.action === 'customer.save') {
      const data = parseJsonParam(params.data);
      return jsonResponse({ ok: true, row: saveRow(SHEETS.Customer, data) }, params.callback);
    }
    if (params.action === 'customer.delete') {
      deleteRow(SHEETS.Customer, params.id);
      return jsonResponse({ ok: true }, params.callback);
    }
    if (params.action === 'booking.save') {
      const data = parseJsonParam(params.data);
      return jsonResponse({ ok: true, row: saveRow(SHEETS.Bookings, data) }, params.callback);
    }
    if (params.action === 'booking.delete') {
      deleteRow(SHEETS.Bookings, params.id);
      return jsonResponse({ ok: true }, params.callback);
    }

    return jsonResponse({ ok: false, error: 'Unknown action' }, params.callback);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, (e.parameter || {}).callback);
  }
}

function doPost(e) {
  try {
    const body = parseBody(e);
    verifyToken(body.token);

    const action = body.action;
    if (action === 'customer.save') {
      return jsonResponse({ ok: true, row: saveRow(SHEETS.Customer, body.data || {}) });
    }
    if (action === 'customer.delete') {
      deleteRow(SHEETS.Customer, body.id);
      return jsonResponse({ ok: true });
    }
    if (action === 'booking.save') {
      return jsonResponse({ ok: true, row: saveRow(SHEETS.Bookings, body.data || {}) });
    }
    if (action === 'booking.delete') {
      deleteRow(SHEETS.Bookings, body.id);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

function parseBody(e) {
  if (!e) return {};
  if (!e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function parseJsonParam(value) {
  if (!value) return {};
  return JSON.parse(value);
}

function verifyToken(token) {
  if (token !== CONFIG.API_TOKEN) {
    throw new Error('Invalid token.');
  }
}

function getSheetConfig(sheetName) {
  const config = SHEETS[sheetName];
  if (!config) throw new Error('Unknown sheet.');
  return config;
}

function getSheet(config) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(config.name);
  if (!sheet) sheet = ss.insertSheet(config.name);
  ensureHeaders(sheet, config.headers);
  return sheet;
}

function ensureHeaders(sheet, requiredHeaders) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  let headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);

  if (headers.every(header => header.trim() === '')) {
    sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
    return;
  }

  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length === 0) return;

  sheet.getRange(1, headers.length + 1, 1, missingHeaders.length).setValues([missingHeaders]);
}

function readHeaders(sheet) {
  const lastColumn = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);
}

function listRows(config) {
  const sheet = getSheet(config);
  const headers = readHeaders(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  return sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = formatCell(row[index]);
    });
    return item;
  });
}

function saveRow(config, data) {
  const sheet = getSheet(config);
  const headers = readHeaders(sheet);
  const keyIndex = headers.indexOf(config.key);
  if (keyIndex === -1) throw new Error(`Missing key column: ${config.key}`);

  const normalizedData = {};
  headers.forEach(header => {
    normalizedData[header] = data[header] === undefined || data[header] === null ? '' : data[header];
  });

  if (!String(normalizedData[config.key] || '').trim()) {
    normalizedData[config.key] = generateId(config.prefix);
  }
  if (headers.includes('วันที่ลงรายการ') && !String(normalizedData['วันที่ลงรายการ'] || '').trim()) {
    normalizedData['วันที่ลงรายการ'] = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'd/M/yyyy HH:mm:ss');
  }

  const id = String(normalizedData[config.key]).trim();
  const rowNumber = findRowNumberById(sheet, keyIndex + 1, id);
  const rowValues = headers.map(header => normalizedData[header]);

  if (rowNumber) {
    sheet.getRange(rowNumber, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return normalizedData;
}

function deleteRow(config, id) {
  if (!id) throw new Error('Missing id.');

  const sheet = getSheet(config);
  const headers = readHeaders(sheet);
  const keyIndex = headers.indexOf(config.key);
  if (keyIndex === -1) throw new Error(`Missing key column: ${config.key}`);

  const rowNumber = findRowNumberById(sheet, keyIndex + 1, String(id).trim());
  if (!rowNumber) throw new Error('Record not found.');
  sheet.deleteRow(rowNumber);
}

function findRowNumberById(sheet, keyColumn, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const values = sheet.getRange(2, keyColumn, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === id) return i + 2;
  }
  return null;
}

function generateId(prefix) {
  const stamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyMMdd');
  const random = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${stamp}-${random}`;
}

function formatCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, CONFIG.TIMEZONE, 'd/M/yyyy HH:mm:ss');
  }
  return value === null || value === undefined ? '' : String(value);
}

function jsonResponse(payload, callback) {
  let text = JSON.stringify(payload);
  let mimeType = ContentService.MimeType.JSON;

  if (typeof callback === 'string' && callback) {
    text = `${callback}(${text});`;
    mimeType = ContentService.MimeType.JAVASCRIPT;
  }

  const output = ContentService.createTextOutput(text);
  output.setMimeType(mimeType);
  return output;
}
