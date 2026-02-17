import { readRange } from "../../lib/googleSheets";

export default async function handler(req, res) {
  try {
    const rows = await readRange("roles!A1:C5");
    res.json({
      ok: true,
      hasEnv: {
        GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
        GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
        JWT_SECRET: !!process.env.JWT_SECRET,
      },
      idPreview: (process.env.GOOGLE_SHEETS_ID || "").slice(0, 8) + "...",
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      rows,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e.message,
      hasEnv: {
        GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
        GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
        JWT_SECRET: !!process.env.JWT_SECRET,
      },
      idPreview: (process.env.GOOGLE_SHEETS_ID || "").slice(0, 8) + "...",
    });
  }
}
