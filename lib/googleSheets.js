import { google } from "googleapis";

/** ===== Helpers ===== */
function getSpreadsheetId() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID || process.env.GSHEET_ID;
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID / GSHEET_ID belum diset.");
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

  key = key.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Google Service Account env belum lengkap.");
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

/** ===== API ===== */

export async function readRange(range) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return res.data.values || [];
}

export async function appendRow(sheetName, row) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export async function updateRow(sheetName, rowIndex1Based, row) {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getSheetsClient();

  const lastColLetter = columnToLetter(row.length);
  const range = `${sheetName}!A${rowIndex1Based}:${lastColLetter}${rowIndex1Based}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

// ✅ khusus products A..N (14 kolom)
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
}
