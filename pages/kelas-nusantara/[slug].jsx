import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function KelasDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [materi, setMateri] = useState([]);

  useEffect(() => {
    if (!slug) return;

    fetch(`/.netlify/functions/materi-list?kelas_slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setMateri(data.data);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold capitalize">
          {String(slug || "").replace(/-/g, " ")}
        </h1>

        <div className="mt-8 grid gap-4">
          {materi.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-semibold">{item.judul}</h2>
              <p className="mt-2 text-gray-500">{item.deskripsi}</p>

              <button
                onClick={() =>
                  router.push(`/kelas-nusantara/materi/${item.id}`)
                }
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-white"
              >
                Buka Materi
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}