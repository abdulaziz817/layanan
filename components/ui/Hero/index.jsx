/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useMemo, useState } from "react";
import { Download, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const services = useMemo(
    () => [
      "Desain Grafis Profesional",
      "Pembuatan Website Modern",
      "Preset Fotografi Eksklusif",
      "Aplikasi Premium Harga Terbaik",
      "Digital Video Editing"
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [fadeStage, setFadeStage] = useState("fadeIn");

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeStage("fadeOut");

      const timeout = setTimeout(() => {
        setIndex((prev) => (prev + 1) % services.length);
        setFadeStage("fadeIn");
      }, 600);

      setTimeout(() => clearTimeout(timeout), 700);
    }, 3000);

    return () => clearInterval(interval);
  }, [services.length]);

  useEffect(() => {
    const checkInstalled = () => {
      const installed =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches ||
        window.navigator.standalone === true;

      setIsInstalled(installed);

      if (installed) {
        setCanInstall(false);
        setDeferredPrompt(null);
      }
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();

      const installed =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.matchMedia("(display-mode: window-controls-overlay)").matches ||
        window.navigator.standalone === true;

      if (installed) {
        setIsInstalled(true);
        setCanInstall(false);
        setDeferredPrompt(null);
        return;
      }

      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("resize", checkInstalled);
    document.addEventListener("visibilitychange", checkInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("resize", checkInstalled);
      document.removeEventListener("visibilitychange", checkInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt || isInstalled) return;

    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice?.outcome === "accepted") {
        setCanInstall(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("Install gagal:", error);
    }
  };

  const fadeClass =
    fadeStage === "fadeIn"
      ? "opacity-100 translate-y-0 scale-100"
      : "opacity-0 translate-y-4 scale-95";

  return (
    <section className="bg-white px-6 py-20 sm:py-28 min-h-screen flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center text-gray-800 mt-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-8">
          Solusi Jasa Layanan Terpercaya
        </h1>

        <div className="relative min-h-[72px] sm:min-h-[96px] mb-6 flex items-center justify-center">
          <h2
            className={`px-3 text-center text-2xl sm:text-4xl font-semibold text-indigo-600 transition-all duration-700 ease-in-out transform ${fadeClass}`}
          >
            {services[index]}
          </h2>
        </div>

        <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-10">
          Kami menyediakan layanan berkualitas tinggi untuk kebutuhan teknologi dan kreativitas Anda.
        </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5">
  <Link
    href="/order"
    className="
      group
      inline-flex items-center justify-center gap-2
      px-7 py-3.5
      rounded-2xl
      bg-gradient-to-r from-indigo-600 to-indigo-500
      text-white font-semibold
      shadow-[0_10px_30px_rgba(79,70,229,0.35)]
      hover:shadow-[0_16px_40px_rgba(79,70,229,0.45)]
      hover:-translate-y-0.5
      transition-all duration-300
      text-center
    "
  >
    Pesan Layanan

    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
  </Link>

  {isInstalled ? (
    <a
      href="https://wa.me/6287860592111"
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center justify-center gap-2
        px-7 py-3.5
        rounded-2xl
        border border-indigo-200
        bg-white/90
        backdrop-blur-md
        text-indigo-700 font-semibold
        hover:bg-indigo-50
        hover:border-indigo-300
        hover:-translate-y-0.5
        transition-all duration-300
        shadow-sm
      "
    >
      <MessageCircle className="w-4 h-4" />
      Chat Sekarang
    </a>
  ) : canInstall && deferredPrompt ? (
    <button
      onClick={installApp}
      className="
        group
        inline-flex items-center justify-center gap-2
        px-7 py-3.5
        rounded-2xl
        border border-indigo-200
        bg-white/90
        backdrop-blur-md
        text-indigo-700 font-semibold
        hover:bg-indigo-50
        hover:border-indigo-300
        hover:-translate-y-0.5
        transition-all duration-300
        shadow-sm
      "
    >
      <Download className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
      Unduh Aplikasi
    </button>
  ) : null}
</div>
      </div>
    </section>
  );
}