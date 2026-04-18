import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MateriDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [status, setStatus] = useState("belum");

  // Ambil status dari localStorage
  useEffect(() => {
    if (!id) return;

    const saved = localStorage.getItem(`materi_${id}`);
    if (saved) setStatus(saved);
  }, [id]);

  // Tandai selesai
  const handleSelesai = () => {
    localStorage.setItem(`materi_${id}`, "selesai");
    setStatus("selesai");
  };

  // Download
  const handleDownload = () => {
    console.log("Download materi", id);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          ← Kembali
        </button>

        {/* Judul */}
        <h1 className="text-3xl font-bold text-gray-900">
          Materi {id}
        </h1>

        {/* Status */}
        <p className="mt-2 text-sm">
          Status:{" "}
          <span className="font-semibold">
            {status === "selesai"
              ? "Selesai ✅"
              : "Belum selesai"}
          </span>
        </p>

        {/* Isi */}
        <p className="mt-4 text-gray-600">
          Ini isi materi {id}. Nanti bisa diambil dari spreadsheet.
        </p>

        {/* Action */}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={handleSelesai}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            {status === "selesai"
              ? "Sudah Selesai"
              : "Tandai Selesai"}
          </button>

          <button
            onClick={handleDownload}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}