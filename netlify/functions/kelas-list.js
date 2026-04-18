exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      GOOGLE_SHEETS_ID_KELAS: !!process.env.GOOGLE_SHEETS_ID_KELAS,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY_BASE64: !!process.env.GOOGLE_PRIVATE_KEY_BASE64,
    }),
  };
};