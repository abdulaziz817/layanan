import { useRouter } from "next/router";

export default function LayananKategori() {
  const router = useRouter();

  const dataKategori = [
    {
      kode: "WD",
      title: "Web Development",
      subtitle: "Belajar website modern dari dasar sampai project.",
      kategori: "Teknologi",
      materi: "Frontend, Backend, Fullstack",
      slug: "/kelas-nusantara/web-development",
    },
    {
      kode: "DG",
      title: "Desain Grafis",
      subtitle: "Bangun skill visual kreatif untuk branding dan konten.",
      kategori: "Kreatif",
      materi: "Photoshop, Illustrator, Branding",
      slug: "/kelas-nusantara/desain-grafis",
    },
    {
      kode: "FT",
      title: "Fotografi",
      subtitle: "Pelajari teknik foto, lighting, dan editing secara praktis.",
      kategori: "Visual",
      materi: "Camera, Editing, Lighting",
      slug: "/kelas-nusantara/fotografi",
    },
    {
      kode: "BM",
      title: "Bisnis Management",
      subtitle: "Pahami strategi, perencanaan, dan pengelolaan usaha.",
      kategori: "Bisnis",
      materi: "Marketing, Finance, Planning",
      slug: "/kelas-nusantara/bisnis-management",
    },
  ];

const handleMasukKelas = (slug) => {
  router.push(slug);
};

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700">
            Kelas Nusantara
          </span>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pilih Kelas Sesuai Minatmu
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
            Program pembelajaran yang dirancang simpel, terarah, dan relevan
            untuk pengembangan skill masa kini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dataKategori.map((item, index) => (
            <div
              key={index}
              onClick={() => handleMasukKelas(item.slug)}
              className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="mb-5 h-1 w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-lg font-bold text-white shadow-md">
                  {item.kode}
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition group-hover:border-blue-200 group-hover:text-blue-600">
                  →
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {item.subtitle}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Kategori
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {item.kategori}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Materi
                  </p>
                  <p className="mt-1 text-sm font-medium leading-6 text-gray-700">
                    {item.materi}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition group-hover:bg-blue-700">
                  Masuk Kelas
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}