/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useState } from "react";

const Hero = () => {
  const services = [
    "Desain Grafis Profesional",
    "Pembuatan Website Modern",
    "Preset Fotografi Eksklusif",
    "Aplikasi Premium Harga Terbaik",
  ];

  const [index, setIndex] = useState(0);
  const [fadeStage, setFadeStage] = useState("fadeIn");

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeStage("fadeOut");

      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % services.length);
        setFadeStage("fadeIn");
      }, 600);

      return () => clearTimeout(timeout);
    }, 3000);

    return () => clearInterval(interval);
  }, [services.length]); // ← tambahkan ini

  const fadeClass =
    fadeStage === "fadeIn"
      ? "opacity-100 translate-y-0 scale-105"
      : "opacity-0 translate-y-4 scale-95";

  return (
    <section className="bg-white px-6 py-20 sm:py-28 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center text-gray-800 mt-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-8">
          Solusi Jasa Layanan Terpercaya
        </h1>

        <div className="relative h-16 sm:h-20 overflow-hidden mb-6">
          <h2
            className={`absolute inset-0 flex items-center justify-center text-center text-2xl sm:text-4xl font-semibold text-indigo-600 transition-all duration-700 ease-in-out transform ${fadeClass}`}
            style={{ wordBreak: "break-word", paddingLeft: "1rem", paddingRight: "1rem" }}
          >
            {services[index]}
          </h2>
        </div>

        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-10 px-4 sm:px-0">
          Kami menyediakan layanan berkualitas tinggi untuk kebutuhan teknologi dan kreativitas Anda.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 px-4 sm:px-0">
          <a
            href="/order"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-center"
          >
            Pesan Layanan
          </a>

          <a
            href="https://wa.me/6287860592111"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition text-center"
          >
            Chat Sekarang
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
