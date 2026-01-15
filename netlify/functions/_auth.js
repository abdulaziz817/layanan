export function requireAdmin(context) {
  // Ambil user dari Netlify Identity
  const user = context?.clientContext?.user;

  // 1. Belum login sama sekali
  if (!user) {
    return {
      ok: false,
      statusCode: 401,
      body: JSON.stringify({
        error: "Unauthorized: login dulu",
      }),
    };
  }

  // 2. Ambil email admin dari ENV
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.email;

  // 3. Cek apakah email ini admin
  if (
    !userEmail ||
    userEmail.toLowerCase() !== adminEmail.toLowerCase()
  ) {
    return {
      ok: false,
      statusCode: 403,
      body: JSON.stringify({
        error: "Forbidden: bukan admin",
      }),
    };
  }

  // 4. Lolos semua cek → boleh lanjut
  return {
    ok: true,
    user,
  };
}
