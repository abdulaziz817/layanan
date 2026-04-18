import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function KelasDetailPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [progressData, setProgressData] = useState({});

  // Data materi (sementara hardcode)
  const materi = [
    { id: 1, title: "Materi 1 - Pengenalan" },
    { id: 2, title: "Materi 2 - Dasar" },
    { id: 3, title: "Materi 3 - Praktik" },
  ];

  // Ambil progress dari localStorage
  useEffect(() => {
    const data = {};
    materi.forEach((m) => {
      const status = localStorage.getItem(`materi_${m.id}`);
      if (status) data[m.id] = status;
    });
    setProgressData(data);
  }, []);

  // Hitung progress
  const total = materi.length;
  const selesai = materi.filter(
    (m) => progressData[m.id] === "selesai"
  ).length;

  // Cari materi selanjutnya
  const nextMateri =
    materi.find((m) => progressData[m.id] !== "selesai") || materi[0];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Judul */}
        <h1 className="text-3xl font-bold text-gray-900 capitalize">
          {String(slug || "").replace(/-/g, " ")}
        </h1>

        <p className="mt-2 text-gray-500">
          Daftar materi kelas akan tampil di bawah ini.
        </p>

        {/* Progress */}
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Progress: {selesai}/{total} materi selesai
          </p>

          <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{
                width: `${(selesai / total) * 100}%`,
              }}
            />
          </div>

          {/* Tombol lanjut */}
          {nextMateri && (
            <button
              onClick={() =>
                router.push(
                  `/kelas-nusantara/materi/${nextMateri.id}`
                )
              }
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-xl"
            >
              Lanjutkan Materi {nextMateri.id}
            </button>
          )}
        </div>

        {/* List Materi */}
        <div className="mt-8 grid gap-4">
          {materi.map((item) => {
            const isDone = progressData[item.id] === "selesai";

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 shadow-sm ${
                  isDone
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {isDone
                        ? "Sudah selesai ✅"
                        : "Belum selesai"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/kelas-nusantara/materi/${item.id}`
                      )
                    }
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    {isDone ? "Lihat" : "Buka"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}