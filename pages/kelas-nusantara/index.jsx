import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function KelasPage() {
  const [kelas, setKelas] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/.netlify/functions/kelas-list")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setKelas(data.data);
      })
      .catch(() => setKelas([]));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Blue Blur Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-120px] top-[-80px] h-[280px] w-[280px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-[-100px] top-[120px] h-[260px] w-[260px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-[-80px] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 backdrop-blur-sm">
            Kelas Nusantara
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Pilih kelas yang ingin kamu pelajari
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
            Temukan kelas yang paling sesuai untuk kebutuhan belajarmu, lalu
            masuk dan mulai pelajari materi yang sudah tersedia.
          </p>
        </div>

        {/* List */}
        {kelas.length > 0 ? (
          <div className="grid gap-6">
            {kelas.map((item, i) => (
              <div
                key={i}
                onClick={() => router.push(`/kelas-nusantara/${item.slug}`)}
                className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-blue-100/80 bg-white/75 p-1 shadow-[0_10px_40px_rgba(30,64,175,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(30,64,175,0.14)]"
              >
                <div className="rounded-[24px] bg-white/90 p-6 md:p-7">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    {/* Left Content */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-lg">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-gray-900 transition group-hover:text-blue-700 md:text-2xl">
                            {item.nama_kelas}
                          </h2>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status_buka
                                ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                                : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
                            }`}
                          >
                            {item.status_buka
                              ? "Kelas tersedia"
                              : "Belum dibuka"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-gray-600 md:text-[15px]">
                          {item.status_buka
                            ? "Masuk ke kelas ini untuk melihat daftar materi dan mulai belajar dengan tampilan yang rapi dan nyaman."
                            : "Kelas ini belum dapat diakses saat ini. Silakan cek kembali ketika kelas sudah dibuka."}
                        </p>
                      </div>
                    </div>

                    {/* Right CTA */}
                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="hidden text-right md:block">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                          Akses kelas
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-600">
                          Lihat detail dan materi
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 group-hover:scale-[1.03]">
                        <span>Buka Kelas</span>
                        <svg
                          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative hover line */}
                <div className="absolute inset-x-8 bottom-0 h-[3px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-transform duration-300 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-blue-100 bg-white/80 px-6 py-16 text-center shadow-[0_10px_40px_rgba(30,64,175,0.08)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              📘
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Belum ada kelas tersedia
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Kelas akan tampil di sini setelah data tersedia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}