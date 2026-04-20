import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function KelasDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [materi, setMateri] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    fetch(`/.netlify/functions/materi-list?kelas_slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setMateri(data.data);
        else setMateri([]);
      })
      .catch(() => setMateri([]))
      .finally(() => setLoading(false));
  }, [slug]);

  const formattedTitle = useMemo(() => {
    return String(slug || "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [slug]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10 md:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Hero / Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-600 shadow-sm backdrop-blur">
            Kelas Nusantara
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {formattedTitle || "Detail Kelas"}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Jelajahi seluruh materi yang tersedia dalam kelas ini.
          </p>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-3xl">
          {/* Loading State */}
          {loading && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
                    <div className="mt-5 h-10 w-32 rounded-xl bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && materi.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📚
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                Belum ada materi
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Materi untuk kelas ini belum tersedia. Silakan cek kembali nanti.
              </p>
            </div>
          )}

          {/* Materi List */}
          {!loading && materi.length > 0 && (
            <div className="space-y-5">
              {materi.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Accent */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        Materi {index + 1}
                      </div>

                      <h2 className="text-xl font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-700">
                        {item.judul}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-slate-600 md:text-[15px]">
                        {item.deskripsi || "Deskripsi materi belum tersedia."}
                      </p>
                    </div>

                    <div className="flex md:justify-end">
                      <button
                        onClick={() =>
                          router.push(`/kelas-nusantara/materi/${item.id}`)
                        }
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Buka Materi
                        <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}