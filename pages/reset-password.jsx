import Head from "next/head";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [phone, setPhone] = useState("");

  // hasil dari request token
  const [resetId, setResetId] = useState("");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // input password baru
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // show/hide
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  // step: 1 request token, 2 confirm reset, 3 selesai
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestToken = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // reset state hasil request sebelumnya
    setResetId("");
    setToken("");
    setExpiresAt("");

    const p = String(phone || "").trim();
    if (!p) {
      setError("Nomor WA wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/user/auth/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: p }),
      });

      const j = await r.json();

      if (!r.ok || !j?.ok) {
        setError(j?.error || "Gagal request token reset.");
        return;
      }

      setResetId(j.reset_id || "");
      setToken(j.token || "");
      setExpiresAt(j.expires_at || "");

      setSuccess("Token reset berhasil dibuat. Lanjut isi password baru.");
      setStep(2);
    } catch (err) {
      setError("Terjadi error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const t = String(token || "").trim();
    const rid = String(resetId || "").trim();
    const np = String(newPassword || "");

    if (!rid) {
      setError("reset_id kosong. Ulangi request token.");
      return;
    }
    if (!t) {
      setError("Token reset kosong. Ulangi request token.");
      return;
    }
    if (np.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }
    if (np !== confirmNewPassword) {
      setError("Password baru dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/user/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reset_id: rid,
          token: t,
          new_password: np,
        }),
      });

      const j = await r.json();

      if (!r.ok || !j?.ok) {
        setError(j?.error || "Gagal reset password.");
        return;
      }

      setSuccess("Password berhasil direset. Silakan login.");
      setStep(3);
    } catch (err) {
      setError("Terjadi error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - Layanan Nusantara</title>
      </Head>

      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-indigo-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 17v.01" />
                <path d="M9.1 9a3 3 0 1 1 5.82 1c-.9 1.2-1.92 1.6-1.92 3" />
                <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-sm text-gray-500 mt-1">
              Request token reset, lalu set password baru.
            </p>
          </div>

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-6">
            {error ? (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
                <div className="flex gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 mt-0.5 flex-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            {success ? (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl">
                <div className="flex gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 mt-0.5 flex-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            ) : null}

            {/* STEP INDICATOR */}
            <div className="mb-4 flex items-center gap-2 text-xs text-gray-600">
              <span className={`px-2 py-1 rounded-full border ${step === 1 ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"}`}>
                1. Request
              </span>
              <span className={`px-2 py-1 rounded-full border ${step === 2 ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"}`}>
                2. Password Baru
              </span>
              <span className={`px-2 py-1 rounded-full border ${step === 3 ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200"}`}>
                3. Selesai
              </span>
            </div>

            {/* STEP 1: REQUEST TOKEN */}
            {step === 1 && (
              <form onSubmit={requestToken} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Nomor WhatsApp</label>
                  <div className="mt-2 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.09a2 2 0 0 1 2.11-.45c.8.26 1.64.45 2.5.57A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-white px-10 py-3 text-gray-900 placeholder:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                      placeholder="08xxxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="numeric"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Token reset akan muncul sekali di halaman ini (sesuai sistem kamu).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700
                             disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Memproses...
                    </>
                  ) : (
                    "Request Token Reset"
                  )}
                </button>

                <div className="text-sm text-gray-600">
                  Ingat password?{" "}
                  <Link className="text-indigo-700 font-semibold hover:underline" href="/login">
                    Login
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 2: CONFIRM RESET */}
            {step === 2 && (
              <form onSubmit={confirmReset} className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Reset ID</p>
                      <p className="font-semibold break-all">{resetId || "-"}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                      Info Token
                    </span>
                  </div>

                  <div className="my-3 h-px bg-gray-200" />

                  <p className="text-xs text-gray-500">Token Reset (tampil sekali)</p>
                  <p className="font-semibold break-all">{token || "-"}</p>

                  <div className="my-3 h-px bg-gray-200" />

                  <p className="text-xs text-gray-500">Berlaku sampai</p>
                  <p className="font-semibold break-all">{expiresAt || "-"}</p>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="text-sm font-medium text-gray-800">Password Baru</label>
                  <div className="mt-2 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>

                    <input
                      type={showPw ? "text" : "password"}
                      className="w-full rounded-xl border border-gray-200 bg-white px-10 pr-12 py-3 text-gray-900 placeholder:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute inset-y-0 right-2 my-2 px-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700
                                 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                      title={showPw ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPw ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.64-1.52 1.63-2.98 2.9-4.26" />
                          <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                          <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.3 11.3 0 0 1-2.07 3.19" />
                          <path d="M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="text-sm font-medium text-gray-800">Konfirmasi Password Baru</label>
                  <div className="mt-2 relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 12l2 2 4-4" />
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>

                    <input
                      type={showPw2 ? "text" : "password"}
                      className="w-full rounded-xl border border-gray-200 bg-white px-10 pr-12 py-3 text-gray-900 placeholder:text-gray-400
                                 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                      placeholder="Ulangi password baru"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPw2((v) => !v)}
                      className="absolute inset-y-0 right-2 my-2 px-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700
                                 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      aria-label={showPw2 ? "Sembunyikan password" : "Tampilkan password"}
                      title={showPw2 ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPw2 ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.64-1.52 1.63-2.98 2.9-4.26" />
                          <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                          <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.3 11.3 0 0 1-2.07 3.19" />
                          <path d="M1 1l22 22" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {confirmNewPassword.length > 0 ? (
                    <p className={`mt-2 text-xs ${newPassword === confirmNewPassword ? "text-green-600" : "text-red-600"}`}>
                      {newPassword === confirmNewPassword ? "Password cocok ✅" : "Password belum sama ❌"}
                    </p>
                  ) : null}

                  <p className="text-xs text-gray-400 mt-2">
                    Setelah berhasil, kamu bisa login pakai password baru.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700
                             disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Password Baru"
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setSuccess("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                    setShowPw(false);
                    setShowPw2(false);
                  }}
                  className="w-full border border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Ulangi Request Token
                </button>
              </form>
            )}

            {/* STEP 3: DONE */}
            {step === 3 && (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full text-center bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700"
                >
                  Ke Login
                </Link>

                <Link
                  href="/"
                  className="block w-full text-center border border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Layanan Nusantara
          </p>
        </div>
      </div>
    </>
  );
}