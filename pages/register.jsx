import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // kalau sudah login, langsung lempar
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/user/auth/me");
        const data = await res.json();
        if (data?.ok) {
          const returnTo = router.query.returnTo ? String(router.query.returnTo) : "/profil";
          router.replace(returnTo);
          return;
        }
      } catch (e) {
        // ignore
      } finally {
        setChecking(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const p = phone.trim();
    const n = name.trim();

    if (!p || !n || !password.trim() || !confirmPassword.trim()) {
      setError("Nomor WA, nama, password, dan konfirmasi password wajib diisi.");
      return;
    }
    if (!/^08\d{8,}$/.test(p)) {
      setError("Nomor WA tidak valid. Gunakan format 08xxxxxxxxxx");
      return;
    }
    if (n.length < 3) {
      setError("Nama minimal 3 karakter.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: p,
          name: n,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error || "Gagal daftar.");
        return;
      }

      setSuccess("Berhasil daftar. Sekarang login dulu ya.");
      setTimeout(() => {
        const returnTo = router.query.returnTo ? String(router.query.returnTo) : "/profil";
        router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      }, 800);
    } catch (err) {
      setError("Terjadi error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
          <p>Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Daftar - Layanan Nusantara</title>
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
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
            <p className="text-sm text-gray-500 mt-1">
              Buat akun pakai nomor WhatsApp dan password.
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

            <form onSubmit={onSubmit} className="space-y-4">
              {/* WA */}
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
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Nama */}
              <div>
                <label className="text-sm font-medium text-gray-800">Nama</label>
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-white px-10 py-3 text-gray-900 placeholder:text-gray-400
                               focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    placeholder="Nama kamu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-800">Password</label>
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Konfirmasi Password */}
              <div>
                <label className="text-sm font-medium text-gray-800">Konfirmasi Password</label>
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
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

                {/* indikator cocok/tidak */}
                {confirmPassword.length > 0 ? (
                  <p className={`mt-2 text-xs ${password === confirmPassword ? "text-green-600" : "text-red-600"}`}>
                    {password === confirmPassword ? "Password cocok ✅" : "Password belum sama ❌"}
                  </p>
                ) : null}
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
                    Mendaftar...
                  </>
                ) : (
                  "Daftar"
                )}
              </button>
            </form>

            <div className="mt-5 text-sm text-gray-600">
              Sudah punya akun?{" "}
             <Link href="/login" className="...">Masuk</Link>
            </div>
          </div>

          
        </div>
      </div>
    </>
  );
}