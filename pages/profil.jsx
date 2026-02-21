import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

export default function ProfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const returnTo = useMemo(() => {
    const rt = router.query.returnTo ? String(router.query.returnTo) : "/order/diskon";
    return rt;
  }, [router.query.returnTo]);

const avatarChoices = [
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln1",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln2",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln3",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln4",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln5",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln6",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln7",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln8",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln9",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln10",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln11",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=ln12",

];
  useEffect(() => {
    const run = async () => {
      setError("");
      try {
        const res = await fetch("/api/user/auth/me");
        const data = await res.json();

        if (!data?.ok) {
          router.replace(`/login?returnTo=${encodeURIComponent("/profil?returnTo=" + returnTo)}`);
          return;
        }

        setUser(data.user || null);
        setName(data.user?.name || "");
        setAvatarUrl(data.user?.avatar_url || "");
      } catch (e) {
        router.replace(`/login?returnTo=${encodeURIComponent("/profil?returnTo=" + returnTo)}`);
      } finally {
        setChecking(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnTo]);

  const onSave = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const avatarUrlFinal = (avatarUrl || "").trim();

    const res = await fetch("/api/user/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ PENTING
      body: JSON.stringify({
        name: name.trim(),
        avatar_url: avatarUrlFinal,
      }),
    });

    const j = await res.json();

    if (!res.ok || !j?.ok) {
      setError(j?.error || "Gagal simpan profil.");
      return;
    }

    router.replace(returnTo || "/order/diskon");
  } catch (err) {
    setError("Terjadi error. Coba lagi.");
  } finally {
    setLoading(false);
  }
};
const onLogout = async () => {
  setLoading(true);
  try {
    await fetch("/api/user/auth/logout", {
      method: "POST",
      credentials: "include", // ✅ penting biar cookie terhapus
    });
    router.replace("/login");
  } finally {
    setLoading(false);
  }
};

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Memuat profil...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Profil - Layanan Nusantara</title>
      </Head>

      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
              <p className="text-sm text-gray-500 mt-1">
                Lengkapi profil dulu biar bisa lanjut checkout promo.
              </p>
            </div>

            <button
              onClick={onLogout}
              disabled={loading}
              className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            >
              Logout
            </button>
          </div>

          {error ? (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border overflow-hidden bg-gray-50 flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">No Avatar</span>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p>
                <span className="text-gray-500">Nomor:</span>{" "}
                <span className="font-semibold text-gray-900">{user?.phone || "-"}</span>
              </p>
              <p className="mt-1">
                <span className="text-gray-500">Status:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {user?.profile_completed ? "Profil Lengkap" : "Belum Lengkap"}
                </span>
              </p>
            </div>
          </div>

          <form onSubmit={onSave} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-gray-700">Nama</label>
              <input
                className="mt-2 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Pilih Avatar</label>
              <div className="mt-3 grid grid-cols-4 gap-3">
                {avatarChoices.map((url) => {
                  const active = avatarUrl === url;
                  return (
                    <button
                      type="button"
                      key={url}
                      onClick={() => setAvatarUrl(url)}
                      className={
                        "border rounded-xl p-2 hover:bg-gray-50 transition " +
                        (active ? "ring-2 ring-indigo-600 border-indigo-600" : "")
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="avatar" className="w-14 h-14 mx-auto" />
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Avatar ini cuma buat tampilan (kayak WA/IG). Kamu boleh ganti kapan aja.
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-700">Atau isi URL Avatar (opsional)</label>
              <input
                className="mt-2 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Kalau kamu punya foto online (misalnya link gambar), tempel di sini.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Profil"}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Setelah disimpan, kamu otomatis diarahkan ke: <span className="font-semibold">{returnTo}</span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
