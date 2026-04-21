import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function KelasPage() {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    fetch("/.netlify/functions/kelas-list")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.ok && Array.isArray(data.data)) {
          setKelas(data.data);
        } else {
          setKelas([]);
        }
      })
      .catch(() => {
        if (isMounted) setKelas([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenClass = (item) => {
    if (!item.status_buka) return;
    router.push(`/kelas-nusantara/${item.slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
            Kelas Nusantara
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Pilih kelas yang ingin kamu pelajari
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Temukan kelas yang sesuai dengan kebutuhan belajarmu, lalu masuk dan
            mulai pelajari materi yang sudah tersedia.
          </p>
        </div>

        {/* Content */}
        <div className="mt-10 lg:mt-12">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-200" />
                      <div className="space-y-3">
                        <div className="h-5 w-48 rounded bg-slate-200" />
                        <div className="h-4 w-28 rounded bg-slate-200" />
                        <div className="h-4 w-72 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-11 w-36 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : kelas.length > 0 ? (
            <div className="grid gap-4">
              {kelas.map((item, i) => {
                const isOpen = item.status_buka;

                return (
                  <div
                    key={item.slug || i}
                    onClick={() => handleOpenClass(item)}
                    className={[
                      "group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 sm:p-6",
                      isOpen
                        ? "cursor-pointer border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                        : "cursor-not-allowed border-slate-200 opacity-90",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      {/* Left */}
                      <div className="flex items-start gap-4">
                        <div
                          className={[
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                            isOpen
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2
                              className={[
                                "text-lg font-semibold tracking-tight sm:text-xl",
                                isOpen
                                  ? "text-slate-900 group-hover:text-blue-700"
                                  : "text-slate-700",
                              ].join(" ")}
                            >
                              {item.nama_kelas}
                            </h2>

                            <span
                              className={[
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                                isOpen
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                  : "bg-slate-100 text-slate-600 ring-slate-200",
                              ].join(" ")}
                            >
                              {isOpen ? "Tersedia" : "Belum dibuka"}
                            </span>
                          </div>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            {isOpen
                              ? "Masuk ke kelas ini untuk melihat daftar materi dan mulai belajar dengan tampilan yang nyaman dan terstruktur."
                              : "Kelas ini belum dapat diakses saat ini. Silakan cek kembali ketika kelas sudah dibuka."}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <div className="hidden text-right md:block">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Akses kelas
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {isOpen ? "Lihat detail dan materi" : "Belum tersedia"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenClass(item);
                          }}
                          disabled={!isOpen}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
                            isOpen
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-slate-100 text-slate-400",
                          ].join(" ")}
                        >
                          <span>{isOpen ? "Buka Kelas" : "Segera Hadir"}</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📘
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                Belum ada kelas tersedia
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Kelas akan tampil di sini setelah data tersedia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}