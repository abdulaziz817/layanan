"use client";
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Mulai animasi masuk
    const enter = setTimeout(() => setShow(true), 50);

    // Mulai animasi keluar total 2 detik
    const exit = setTimeout(() => {
      setHide(true);
      setShow(false);

      setTimeout(() => {
        setVisible(false);
        onFinish();
      }, 700); // durasi animasi keluar
    }, 2000); // total durasi splash

    return () => {
      clearTimeout(enter);
      clearTimeout(exit);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <div
        className={`
          flex flex-col items-center text-center
          transition-all duration-[750ms] ease-[cubic-bezier(.25,.8,.25,1)]
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-75"}
          ${hide ? "opacity-0 scale-75" : ""}
        `}
      >

        {/* Glow super ringan */}
        <div
          className={`
            absolute w-24 h-24 rounded-full bg-indigo-500 blur-xl 
            transition-all duration-[900ms]
            ${show ? "opacity-15 scale-110" : "opacity-0 scale-75"}
            ${hide ? "opacity-0 scale-90" : ""}
          `}
        ></div>

        {/* Logo */}
        <div
          className={`
            relative w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full shadow-md
            flex items-center justify-center
            transition-all duration-[750ms]
            ${show ? "opacity-100 scale-100" : "opacity-0 scale-75"}
            ${hide ? "opacity-0 scale-75" : ""}
          `}
        >
          <img
            src="/image/nusantaralogo.png"
            alt="Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
          />
        </div>

        {/* Title */}
        <h1
          className={`
            mt-6 text-lg sm:text-2xl font-semibold text-gray-800 tracking-wide
            transition-all duration-[800ms]
            ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}
            ${hide ? "opacity-0 scale-90" : ""}
          `}
        >
          Layanan Nusantara
        </h1>

        {/* Description */}
        <p
          className={`
            mt-1 text-sm sm:text-base text-gray-500
            transition-all duration-[850ms]
            ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}
            ${hide ? "opacity-0 scale-90" : ""}
          `}
        >
          Solusi Jasa Layanan Terpercaya
        </p>
      </div>
    </div>
  );
}
    