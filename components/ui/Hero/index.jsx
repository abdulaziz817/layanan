/* eslint-disable @next/next/no-html-link-for-pages */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function Hero() {
  const services = useMemo(
    () => [
      "Desain Grafis Profesional",
      "Pembuatan Website Modern",
      "Preset Fotografi Eksklusif",
      "Aplikasi Premium Harga Terbaik",
      "Baso Ikan Tuna",
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

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
          <Link
            href="/order"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-center"
          >
            Pesan Layanan
          </Link>

          {isInstalled ? (
            <a
              href="https://wa.me/6287860592111"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition text-center"
            >
              Chat Sekarang
            </a>
          ) : canInstall && deferredPrompt ? (
            <button
              onClick={installApp}
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition text-center"
            >
              Unduh Aplikasi
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}