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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {kelas.map((item, i) => (
          <div
            key={i}
            onClick={() => router.push(`/kelas-nusantara/${item.slug}`)}
            className="cursor-pointer rounded-2xl border p-6 bg-white shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold">{item.nama_kelas}</h2>
            <p className="text-gray-500 mt-2">
              Klik untuk masuk ke kelas
            </p>

            <div className="mt-4 text-sm">
              Status:{" "}
              <span className="font-semibold text-green-600">
                {item.status_buka ? "Dibuka" : "Ditutup"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}