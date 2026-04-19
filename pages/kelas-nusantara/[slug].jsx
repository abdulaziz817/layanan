import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
      })
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">
            {String(slug || "").replace(/-/g, " ")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Daftar materi yang tersedia dalam kelas ini
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-sm text-gray-500">Memuat materi...</p>
        )}

        {/* Empty State */}
        {!loading && materi.length === 0 && (
          <div className="rounded-xl border border-dashed bg-white p-6 text-center text-gray-500">
            Belum ada materi tersedia
          </div>
        )}

        {/* List Materi */}
        <div className="grid gap-4">
          {materi.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {item.judul}
              </h2>

              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {item.deskripsi}
              </p>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() =>
                    router.push(`/kelas-nusantara/materi/${item.id}`)
                  }
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                >
                  Buka Materi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}