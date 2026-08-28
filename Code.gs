// ============================================================
// Google Apps Script — รวม API สำหรับทุก Sheet
// วิธี Deploy:
//   Extensions → Apps Script → วางโค้ดนี้ทับ Code.gs
//   Deploy → New deployment → Web app
//     - Execute as: Me
//     - Who has access: Anyone
//   Copy URL ไปใส่ใน index.html ตัวแปร SCRIPT_URL
// ============================================================

const SHEET_ID = '1u__xYWoWZpmrnquc-Fpk19WtpcrckxSd0-_G35NWxXQ';
const WRITE_TOKEN_PROPERTY = 'CAR_CRM_WRITE_TOKEN';

// ─── Column definitions ───────────────────────────────────────
const SCHEMA = {
  ความเสียหายอื่นๆ: {
    idPrefix: 'MI',
    idField: 'MI_ID',
    columns: [
      'MI_ID', 'CustID', 'รายการ', 'มูลค่า', 'ช่าง', 'หมายเหตุ',
      'รูปภาพ_1', 'รูปภาพ_2', 'รูปภาพ_3', 'วันที่ลงรายการ', 'นำไปหักคอมรอบ'
    ]
  },
  ขนาดกระจก: {
    idPrefix: 'Size',
    idField: 'ID',
    columns: [
      'ID', 'JobID', 'รุ่นรถยนต์', 'ตำแหน่งติดตั้ง',
      'บานหน้า', 'บานหลัง',
      'ประตูหน้า-ซ้าย', 'ประตูหน้า-ขวา',
      'ประตูหลัง-ซ้าย', 'ประตูหลัง-ขวา',
      'บานฟิก-ซ้าย', 'บานฟิก-ขวา',
      'ซันรูฟ-ช่อง1', 'ซันรูฟ-ช่อง2',
      'แครี่บอย', 'หมายเหตุ', 'วันที่ลงรายการ'
    ]
  },
  Customer: {
    idPrefix: 'CUS',
    idField: 'CustID',
    columns: [
      'CustID', 'ชื่อลูกค้า', 'เพศ', 'เบอร์โทรศัพท์', 'ช่องทางติดต่อ', 
      'ชื่อช่องทางติดต่อ', 'ชื่อ/บริษัทออกบิล', 'ที่อยู่สำหรับออกบิล', 
      'เลขประจำตัวผู้เสียภาษี', 'หมายเหตุ', 'รู้จักครั้งแรก', 'วันที่บันทึก'
    ]
  },
  สถิตการติดต่อ: {
    idPrefix: 'ST',
    idField: 'ST_ID',
    columns: [
      'ST_ID', 'วันที่', 'โทร', 'Line', 'FB', 'Tiktok', 'WalkIn',
      'หมายเหตุ', 'ผู้บันทึก', 'วันที่บันทึกรายการ'
    ]
  },
  Detail_Installer: {
    idPrefix: 'DT',
    idField: 'Ins_ID',
    columns: [
      'Ins_ID', 'JobID', 'ตำแหน่งติดตั้ง',
      'บานหน้า', 'บานหลัง',
      'ประตูหน้า-ซ้าย', 'ประตูหน้า-ขวา',
      'ประตูหลัง-ซ้าย', 'ประตูหลัง-ขวา',
      'บานฟิก-ซ้าย', 'บานฟิก-ขวา',
      'ซันรูฟ-ช่อง1', 'ซันรูฟ-ช่อง2',
      'แครี่บอย', 'วันที่ลงรายการ'
    ]
  },
  Detail_film: {
    idPrefix: 'Cut',
    idField: 'Detail_ID',
    columns: [
      'Detail_ID', 'JobID', 'ขอตัดฟิล์ม', 'ตำแหน่งติดตั้ง', 'ยี่ห้อฟิล์ม',
      'บานหน้า', 'บานหลัง',
      'ประตูหน้า-ซ้าย', 'ประตูหน้า-ขวา',
      'ประตูหลัง-ซ้าย', 'ประตูหลัง-ขวา',
      'บานฟิก-ซ้าย', 'บานฟิก-ขวา',
      'ซันรูฟ-ช่อง1', 'ซันรูฟ-ช่อง2',
      'แครี่บอย', 'เหตุผลขอตัดฟิล์ม', 'หมายเหตุ', 'วันที่ลงรายการ'
    ]
  },
  Waranty: {
    idPrefix: 'WA',
    idField: 'WA_ID',
    columns: [
      'WA_ID', 'JobID', 'ทะเบียนรถ',
      'เลขที่ใบรับประกัน', 'ปีรับประกัน',
      'วันที่เริ่ม', 'สิ้นสุด',
      'หมายเหตุ', 'วันที่ลงรายการ'
    ]
  },
  PayIn: {
    idPrefix: 'PAY',
    idField: 'Pay_ID',
    columns: [
      'Pay_ID', 'JobID', 'สถานะ',
      'ใบเสนอราคา', 'เลขที่บิล/ใบเสร็จ',
      'ประเภทการชำระ', 'ยอดเงิน(บาท)',
      'หมายเหตุ', 'หลักฐาน_1', 'หลักฐาน_2',
      'วันที่บันทึกรายการ'
    ]
  },
  Bookings: {
    idPrefix: 'JOB',
    idField: 'JobID',
    columns: [
      'JobID', 'CustID', 'พน.ขาย', 'วันที่ติดตั้ง', 'เวลานัด',
      'ประเภทลูกค้า', 'รุ่นรถยนต์', 'ทะเบียนรถ', 'ป้าย', 'ยี่ห้อฟิล์ม',
      'ตำแหน่งติดตั้ง', 'มูลค่าสินค้า', 'ส่วนลด', 'รหัสส่วนลด', 'ยอดขาย',
      'การรับประกัน', 'Pro_ID', 'WA_ID', 'หมายเหตุ', 'Status',
      'Colorstatus', 'รูปภาพ_01', 'รูปภาพ_02', 'รูปภาพ_03', 'วันที่ลงรายการ'
    ]
  },
  data: {
    idPrefix: 'MIS',
    idField: 'MIS_ID',
    columns: [
      'MIS_ID', 'JobID', 'ตำแหน่งติดตั้ง', 'รุ่นฟิล์ม',
      'กว้าง', 'ยาว', 'จำนวน', 'ทีมช่าง', 'เหตุผลขอตัดฟิล์ม',
      'หมายเหตุ', 'วันที่ลงรายการ'
    ]
  }
};

// ─── ID Generator ─────────────────────────────────────────────
function generateId(prefix) {
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(2);
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  const dd  = String(now.getDate()).padStart(2, '0');
  const hex = Math.floor(Math.random() * 0x1000).toString(16).toUpperCase().padStart(3, '0');
  if (prefix === 'MIS') return `MIS_${yy}${mm}${dd}-${hex}`;
  return `${prefix}-${yy}${mm}${dd}-${hex}`;
}

function isUnique(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return true;
  const data = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  return !data.some(row => row[0] === id);
}

// ─── Timestamp ────────────────────────────────────────────────
function thaiTimestamp() {
  const now = new Date();
  return `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()+543} ` +
         `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

function ensureHeaderRow(sheet, columns) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(columns);
    return;
  }
  const firstRow = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), columns.length)).getValues()[0];
  const hasHeader = firstRow.some(value => String(value || '').trim() !== '');
  if (!hasHeader) {
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
    return;
  }
  const needsHeaderUpdate = columns.some((column, index) => String(firstRow[index] || '').trim() !== column);
  if (needsHeaderUpdate) {
    sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  }
}

// ─── บันทึกชีต data แบบ batch (เวอร์ชันเร็ว) ────────────────────
// แนวคิด: อ่านข้อมูลทั้งหมด "ครั้งเดียว" → ประมวลผลในหน่วยความจำ →
//        เขียนกลับ "ครั้งเดียว" หลีกเลี่ยง deleteRow/getValue/isUnique แบบวนซ้ำ
function saveDataRows(sheet, schema, body) {
  const jobId = String(body.JobID || '').trim();
  if (!jobId) throw new Error('ไม่พบ JobID');

  ensureHeaderRow(sheet, schema.columns);

  const numCols   = schema.columns.length;
  const jobColIdx = schema.columns.indexOf('JobID');
  const idColIdx  = schema.columns.indexOf(schema.idField);

  // 1) อ่านข้อมูลเดิมทั้งหมดครั้งเดียว
  const lastRow  = sheet.getLastRow();
  const existing = (lastRow >= 2)
    ? sheet.getRange(2, 1, lastRow - 1, numCols).getValues()
    : [];

  // 2) เก็บ ID ที่ใช้แล้วไว้ตรวจความซ้ำในหน่วยความจำ (ไม่อ่านชีตซ้ำ)
  const usedIds = {};
  existing.forEach(r => {
    const v = String(r[idColIdx] || '').trim();
    if (v) usedIds[v] = true;
  });

  // 3) เก็บแถวเดิมที่ "ไม่ใช่" jobId นี้ (แทนการ deleteRow ทีละแถว)
  const kept = existing.filter(r => String(r[jobColIdx] || '').trim() !== jobId);

  // ตัวช่วยสร้าง ID ใหม่ที่ไม่ซ้ำ (เช็คในหน่วยความจำ)
  function genUniqueId() {
    let id = generateId(schema.idPrefix);
    while (usedIds[id]) id = generateId(schema.idPrefix);
    usedIds[id] = true;
    return id;
  }

  const timestamp = thaiTimestamp();
  const savedIds  = [];
  const rows      = Array.isArray(body.rows) ? body.rows : [body];
  const newValues = [];

  rows.forEach(item => {
    const hasUsefulValue = ['ตำแหน่งติดตั้ง', 'รุ่นฟิล์ม', 'กว้าง', 'ยาว', 'จำนวน', 'ทีมช่าง', 'เหตุผลขอตัดฟิล์ม']
      .some(col => String(item[col] || '').trim() !== '');
    if (!hasUsefulValue) return;

    let id = String(item[schema.idField] || '').trim();
    if (!id || usedIds[id]) {
      id = genUniqueId();
    } else {
      usedIds[id] = true;
    }
    savedIds.push(id);

    newValues.push(sanitizeRowValues_(schema.columns.map(col => {
      if (col === schema.idField)    return id;
      if (col === 'JobID')           return jobId;
      if (col === 'วันที่ลงรายการ')  return timestamp;
      return item[col] !== undefined ? item[col] : '';
    })));
  });

  // 4) เขียนกลับครั้งเดียว: ล้างพื้นที่ข้อมูลเดิม แล้วเขียน kept + ใหม่
  const finalRows = kept.concat(newValues);
  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, numCols).clearContent();
  }
  if (finalRows.length) {
    sheet.getRange(2, 1, finalRows.length, numCols).setValues(finalRows);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, ids: savedIds, id: savedIds[0] || '', sheetName: 'data' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function commissionCycleLabel_(now = new Date()) {
  const timeZone = 'Asia/Bangkok';
  const parts = Utilities.formatDate(now, timeZone, 'yyyy,M,d').split(',').map(Number);
  const [currentYear, currentMonth, currentDay] = parts;
  let startYear = currentYear;
  let startMonth = currentMonth;

  // ใช้รอบปัจจุบัน: วันที่ 26 ของเดือนก่อนถึงวันที่ 25 ของเดือนนี้ หรือวันที่ 26 ของเดือนนี้ถึงวันที่ 25 ของเดือนหน้า
  if (currentDay <= 25) {
    startMonth -= 1;
    if (startMonth === 0) {
      startMonth = 12;
      startYear -= 1;
    }
  }

  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth === 13) {
    endMonth = 1;
    endYear += 1;
  }

  return `26/${startMonth}/${String(startYear).slice(-2)} - 25/${endMonth}/${String(endYear).slice(-2)}`;
}

function verifyWriteToken_(body) {
  const expectedToken = String(PropertiesService.getScriptProperties().getProperty(WRITE_TOKEN_PROPERTY) || '').trim();
  if (!expectedToken) {
    throw new Error(`ยังไม่ได้ตั้งค่า Script Property: ${WRITE_TOKEN_PROPERTY}`);
  }

  const providedToken = String(body && body.token ? body.token : '').trim();
  if (!providedToken || providedToken !== expectedToken) {
    throw new Error('Write token ไม่ถูกต้องหรือไม่ได้ระบุ');
  }
}

function sanitizeCellValue_(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  const text = String(value);
  return /^[=+\-@]/.test(text.trimStart()) ? "'" + text : text;
}

function sanitizeRowValues_(row) {
  return row.map(sanitizeCellValue_);
}

function ensurePlainTextColumns_(sheet, schema) {
  const lastColumn = Math.max(sheet.getLastColumn(), schema.columns.length, 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String);

  headers.forEach(function(header, index) {
    if (/เบอร์|โทรศัพท์|phone/i.test(header)) {
      sheet.getRange(1, index + 1, Math.max(sheet.getMaxRows(), 1), 1).setNumberFormat('@');
    }
  });
}

// ─── Main POST handler ────────────────────────────────────────
function formatErrorMessage_(err) {
  const message = String(err && err.message ? err.message : err || '').trim();
  const lowerMessage = message.toLowerCase();
  const isSpreadsheetScopeError =
    lowerMessage.indexOf('spreadsheetapp.openbyid') !== -1 ||
    lowerMessage.indexOf('googleapis.com/auth/spreadsheets') !== -1 ||
    lowerMessage.indexOf('do not have permission') !== -1;

  if (isSpreadsheetScopeError) {
    return 'Apps Script ยังไม่ได้รับสิทธิ์เข้าถึง Google Sheets: ให้รัน authorizeOnce() แล้วกด Allow จากนั้น Deploy เป็นเวอร์ชันใหม่';
  }

  return message || 'เกิดข้อผิดพลาด';
}

function doPost(e) {
  let lock = null;
  try {
    const body      = JSON.parse(e.postData.contents);
    verifyWriteToken_(body);
    lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) {
      throw new Error('ระบบกำลังบันทึกข้อมูลอยู่ กรุณาลองใหม่อีกครั้ง');
    }

    const sheetName = body.sheetName;

    if (!sheetName || !SCHEMA[sheetName]) {
      throw new Error(`ไม่รู้จัก sheetName: "${sheetName}"`);
    }

    const schema = SCHEMA[sheetName];
    const ss     = SpreadsheetApp.openById(SHEET_ID);
    let sheet  = ss.getSheetByName(sheetName);
    if (!sheet && sheetName === 'data') {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(schema.columns);
    }

    if (!sheet) throw new Error(`ไม่พบชีต: "${sheetName}"`);
    ensurePlainTextColumns_(sheet, schema);

    if (sheetName === 'data' && Array.isArray(body.rows)) {
      return saveDataRows(sheet, schema, body);
    }

    if (body.action === 'update' && (body.custId || body.matchPhone || body.recordId || (['PayIn', 'Waranty'].indexOf(sheetName) !== -1 && body.JobID))) {
      const dataRange = sheet.getDataRange();
      const sheetValues = dataRange.getValues();
      const header = sheetValues[0];
      const idIdx = header.indexOf(schema.idField);
      // หาคอลัมน์เบอร์โทรเป็นทางสำรอง เผื่อหา ID ไม่เจอ
      const phoneIdx = header.findIndex(function(h){ return String(h).indexOf('เบอร์') !== -1 || String(h).indexOf('โทร') !== -1; });
      const matchPhoneClean = body.matchPhone ? String(body.matchPhone).replace(/\D/g, '') : '';

      // ค่า ID ที่จะใช้หา: รองรับทั้ง custId (ของเก่า) และ recordId (generic)
      const lookupId = body.recordId || body.custId;

      let targetRowIndex = -1;
      let matchedId = lookupId;

      // 1) หาด้วย ID ตรง ๆ ตาม schema.idField
      if (idIdx !== -1 && lookupId) {
        for (let i = 1; i < sheetValues.length; i++) {
          if (String(sheetValues[i][idIdx]) === String(lookupId)) {
            targetRowIndex = i + 1;
            matchedId = sheetValues[i][idIdx];
            break;
          }
        }
      }

      // 2) ถ้ายังไม่เจอ ลองหาด้วยเบอร์โทรที่กำลังแก้ไข
      if (targetRowIndex === -1 && phoneIdx !== -1 && matchPhoneClean.length >= 9) {
        for (let i = 1; i < sheetValues.length; i++) {
          const rowPhone = String(sheetValues[i][phoneIdx] || '').replace(/\D/g, '');
          if (rowPhone === matchPhoneClean) {
            targetRowIndex = i + 1;
            if (idIdx !== -1) matchedId = sheetValues[i][idIdx];
            break;
          }
        }
      }

      // PayIn / Waranty แก้ไขจากหน้า index.html: ถ้าไม่มี ID ให้หาแถวเดิมด้วย JobID
      if (targetRowIndex === -1 && (sheetName === 'PayIn' || sheetName === 'Waranty') && body.JobID) {
        const jobIdx = header.indexOf('JobID');
        if (jobIdx !== -1) {
          const lookupJobId = String(body.JobID || '').trim();
          for (let i = 1; i < sheetValues.length; i++) {
            if (String(sheetValues[i][jobIdx] || '').trim() === lookupJobId) {
              targetRowIndex = i + 1;
              if (idIdx !== -1) matchedId = sheetValues[i][idIdx];
              break;
            }
          }
        }
      }

      if (targetRowIndex !== -1) {
        const timestamp = thaiTimestamp();
        const existingRow = sheetValues[targetRowIndex - 1]; // แถวเดิม สำหรับเก็บค่าฟิลด์ที่ไม่ได้ส่งมา
        const rowData = schema.columns.map((col, colIdx) => {
          if (col === schema.idField) return matchedId;
          if (col === 'วันที่ลงรายการ') return timestamp;
          if (col === 'วันที่บันทึกรายการ') return timestamp;
          if (col === 'วันที่บันทึก') return timestamp;
          // ถ้า body มีค่า (รวมถึง '') ใช้ค่านั้น; ถ้าไม่ส่งมาเลย ใช้ค่าเดิมจากแถว
          if (body[col] !== undefined) return body[col];
          return (existingRow && existingRow[colIdx] !== undefined) ? existingRow[colIdx] : '';
        });

        sheet.getRange(targetRowIndex, 1, 1, schema.columns.length).setValues([sanitizeRowValues_(rowData)]);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, id: matchedId, action: 'update', sheetName }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'ไม่พบรายการเดิม (CustID/เบอร์โทร) — ยกเลิกการบันทึกเพื่อกันข้อมูลซ้ำ' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (body.action === 'delete' && (body.recordId || body.custId)) {
      const dataRange = sheet.getDataRange();
      const sheetValues = dataRange.getValues();
      const header = sheetValues[0];
      const idIdx = header.indexOf(schema.idField);
      const lookupId = body.recordId || body.custId;

      let targetRowIndex = -1;
      for (let i = 1; i < sheetValues.length; i++) {
        if (String(sheetValues[i][idIdx]) === String(lookupId)) {
          targetRowIndex = i + 1;
          break;
        }
      }

      if (targetRowIndex > -1) {
        sheet.deleteRow(targetRowIndex);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, id: lookupId, action: 'delete', sheetName }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'ไม่พบรายการที่ต้องการลบ' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // สร้าง ID ที่ไม่ซ้ำสำหรับการเพิ่มใหม่
    let id = generateId(schema.idPrefix);
    let attempts = 0;
    while (!isUnique(sheet, id) && attempts < 10) {
      id = generateId(schema.idPrefix);
      attempts++;
    }

    const timestamp = thaiTimestamp();

    const row = schema.columns.map(col => {
      if (col === schema.idField)      return id;
      if (col === 'วันที่ลงรายการ')   return timestamp;
      if (col === 'วันที่บันทึกรายการ') return timestamp;
      if (col === 'วันที่บันทึก') return timestamp;
      if (col === 'นำไปหักคอมรอบ') return commissionCycleLabel_();
      return body[col] !== undefined ? body[col] : '';
    });

    sheet.appendRow(sanitizeRowValues_(row));

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id, sheetName, action: 'insert' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: formatErrorMessage_(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (lock) lock.releaseLock();
  }
}

// ─── ฟังก์ชันสำหรับ "กดอนุญาตสิทธิ์" (รันครั้งเดียว) ──────────────
// เลือกฟังก์ชันนี้ในเมนูด้านบนแล้วกด "เรียกใช้/Run"
// จะมีกล่องขออนุญาตเด้งขึ้น → Allow ให้เข้าถึง Google Sheets
// (doGet ไม่ทำให้สิทธิ์ถูกขอ เพราะไม่ได้แตะ Sheets)
function authorizeOnce() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const names = ss.getSheets().map(function (s) { return s.getName(); });
  Logger.log('เข้าถึงสเปรดชีตสำเร็จ พบชีต: ' + names.join(', '));
  return names;
}

// ─── GET สำหรับทดสอบ ──────────────────────────────────────────
function doGet() {
  const available = Object.keys(SCHEMA).join(', ');
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'API ready', sheets: available }))
    .setMimeType(ContentService.MimeType.JSON);
}
