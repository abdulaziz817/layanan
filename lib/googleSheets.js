import { google } from "googleapis";

/** =========================
 * Helpers (ENV + Client)
 * ========================= */

function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || process.env.GSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEETS_ID / GSHEET_ID belum diset.");
  }
  return spreadsheetId;
}

function getAuth() {
  const email =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    process.env.GSERVICE_CLIENT_EMAIL;

  let key =
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GSERVICE_PRIVATE_KEY ||
    "";

  // penting: private key dari env biasanya mengandung "\n"
  key = String(key).replace(/\\n/g, "\n");

  if (!email) {
    throw new Error(
      "Google Service Account email belum diset (GOOGLE_SERVICE_ACCOUNT_EMAIL / GSERVICE_CLIENT_EMAIL)."
    );
  }
  if (!key) {
    throw new Error(
      "Google Service Account private key belum diset (GOOGLE_PRIVATE_KEY / GSERVICE_PRIVATE_KEY)."
    );
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

// support kolom > 26 (A..Z..AA..)
function columnToLetter(colNumber1Based) {
  let temp = colNumber1Based;
  let letter = "";
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
}

function safeString(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

/** =========================
 * API: Read / Write
 * ========================= */

/**
 * Baca range, contoh:
 * readRange("users!A2:G")
 */
export async function readRange(range) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return res.data.values || [];
}

/**
 * Tulis nilai ke range tertentu (UPDATE range)
 * contoh:
 * writeRange("users!D2:D2", [["Aziz"]])
 */
export async function writeRange(range, values, valueInputOption = "RAW") {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  if (!Array.isArray(values)) {
    throw new Error("writeRange: values harus array 2D, contoh: [[...]]");
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption,
    requestBody: { values },
  });

  return true;
}

/**
 * Append 1 row ke sheet (nambah data di bawah)
 * contoh:
 * appendRow("users", ["u_1","62xxx","Aziz","hash",...])
 */
export async function appendRow(sheetName, row) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const values = [Array.isArray(row) ? row : []];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  return true;
}

/**
 * Update 1 baris full (A..kolom terakhir row)
 * contoh:
 * updateRow("users", 2, ["u_1","62xxx","Aziz",...])
 */
export async function updateRow(sheetName, rowIndex1Based, row) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const arr = Array.isArray(row) ? row : [];
  const lastColLetter = columnToLetter(Math.max(arr.length, 1));
  const range = `${sheetName}!A${rowIndex1Based}:${lastColLetter}${rowIndex1Based}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [arr] },
  });

  return true;
}

/**
 * ✅ khusus products A..N (14 kolom)
 * contoh:
 * updateRowFixedProducts(5, ["p1","nama",...])
 */
export async function updateRowFixedProducts(rowIndex1Based, row) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const fixed = Array.isArray(row) ? [...row] : [];
  while (fixed.length < 14) fixed.push("");
  const finalRow = fixed.slice(0, 14);

  const range = `products!A${rowIndex1Based}:N${rowIndex1Based}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [finalRow] },
  });

  return true;
}

/** =========================
 * Helpers tambahan (pakeful)
 * ========================= */

/**
 * Cari row index berdasarkan nilai di kolom tertentu
 * - sheetName: "users"
 * - colLetter: "A" / "C" dst
 * - value: "u_xxx" atau "6287xxx"
 * return: rowIndex1Based (misal 2), atau -1 kalau tidak ada
 */
export async function findRowIndexByValue(sheetName, colLetter, value) {
  const target = safeString(value).trim();
  if (!target) return -1;

  // baca satu kolom saja (lebih ringan)
  const rows = await readRange(`${sheetName}!${colLetter}2:${colLetter}`);

  // rows = [[val], [val], ...]
  const idx0 = rows.findIndex((r) => safeString(r?.[0]).trim() === target);

  if (idx0 === -1) return -1;

  // +2 karena mulai dari row 2
  return idx0 + 2;
}