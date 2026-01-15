function requireAdmin(context) {
  const user = context && context.clientContext && context.clientContext.user;

  if (!user) {
    return {
      ok: false,
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized: login dulu" }),
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.email;

  if (!adminEmail) {
    return {
      ok: false,
      statusCode: 500,
      body: JSON.stringify({ error: "Server misconfig: ADMIN_EMAIL belum di-set" }),
    };
  }

  if (!userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    return {
      ok: false,
      statusCode: 403,
      body: JSON.stringify({ error: "Forbidden: bukan admin" }),
    };
  }

  return { ok: true, user };
}

exports.handler = async (event, context) => {
  // ✅ Preflight CORS (kalau kamu memang akses lintas domain)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        // Saran aman: kalau frontend kamu 1 domain, ini bisa dihapus.
        // Kalau mau tetap CORS, minimal jangan "*", isi domain kamu:
        "Access-Control-Allow-Origin": "https://layanannusantara.store",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: "",
    };
  }

  // 🔒 KUNCI: wajib admin
  const authz = requireAdmin(context);
  if (!authz.ok) {
    return {
      statusCode: authz.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://layanannusantara.store",
      },
      body: authz.body,
    };
  }

  // Endpoint ini sekarang aman untuk tes/admin ping
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://layanannusantara.store",
    },
    body: JSON.stringify({ ok: true, message: "omset function jalan (admin only)" }),
  };
};
