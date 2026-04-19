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
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Kelas Nusantara
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Pilih kelas untuk mulai belajar
          </p>
        </div>

        {/* List */}
        <div className="space-y-5">
          {kelas.map((item, i) => (
            <div
              key={i}
              onClick={() => router.push(`/kelas-nusantara/${item.slug}`)}
              className="group cursor-pointer relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Accent Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-r from-indigo-50 via-transparent to-transparent"></div>

              <div className="relative flex items-center justify-between">
                
                {/* Left */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition">
                    {item.nama_kelas}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Klik untuk masuk ke kelas ini
                  </p>

                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status_buka
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status_buka ? "Dibuka" : "Ditutup"}
                    </span>
                  </div>
                </div>

                {/* Right CTA */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 group-hover:text-indigo-600 transition">
                    Lihat
                  </span>

                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition group-hover:scale-110">
                    <svg
                      className="w-5 h-5"
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

              {/* Bottom line */}
              <div className="mt-6 h-[2px] w-0 bg-indigo-600 transition-all duration-300 group-hover:w-full"></div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {kelas.length === 0 && (
          <div className="text-center py-20 text-gray-400 text-sm">
            Belum ada kelas tersedia
          </div>
        )}
      </div>
    </div>
  );
}