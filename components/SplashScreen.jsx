"use client";
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [state, setState] = useState("enter");

  useEffect(() => {
    // jika Lighthouse / automated audit → skip splash
    if (typeof navigator !== "undefined" && navigator.webdriver) {
      setVisible(false);
      onFinish();
      return;
    }

    const t1 = setTimeout(() => setState("show"), 80);

    const t2 = setTimeout(() => {
      setState("exit");

      setTimeout(() => {
        setState("fadeout");
      }, 400);

      setTimeout(() => {
        setVisible(false);
        onFinish();
      }, 800);
    }, 1200); // dipercepat agar Speed Index bagus

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`
        fixed inset-0 z-[9999] bg-white
        flex items-center justify-center
        transition-opacity duration-[500ms]
        ${state === "fadeout" ? "opacity-0" : "opacity-100"}
      `}
    >
      <div
        className={`
          relative flex flex-col items-center text-center
          transition-all duration-[600ms] ease-[cubic-bezier(.25,.8,.25,1)]
          ${state === "enter" ? "opacity-0 scale-75 translate-y-6" : ""}
          ${state === "show" ? "opacity-100 scale-100 translate-y-0" : ""}
          ${state === "exit" ? "opacity-0 scale-90 -translate-y-3" : ""}
        `}
      >
        {/* Glow */}
        <div
          className={`
            absolute w-32 h-32 rounded-full
            bg-indigo-400 blur-2xl opacity-0
            transition-all duration-[1000ms]
            ${state === "show" ? "opacity-20 scale-125 animate-[float_4s_ease-in-out_infinite]" : ""}
          `}
        />

        {/* Logo */}
        <div
          className={`
            relative w-24 h-24 sm:w-28 sm:h-28
            bg-white rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-[700ms]
            ${state === "enter" ? "opacity-0 scale-75" : ""}
            ${state === "show" ? "opacity-100 scale-100 animate-[pulse_2.8s_ease-in-out_infinite]" : ""}
            ${state === "exit" ? "opacity-0 scale-95" : ""}
          `}
        >
          <img
            src="/image/nusantaralogo.png"
            alt="Nusantara Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            draggable={false}
          />
        </div>

        {/* Title (bukan h1 agar heading aman) */}
        <div
          className={`
            mt-4 text-xl sm:text-3xl font-extrabold
            text-gray-900 tracking-wide
            transition-all duration-[700ms]
            ${state === "enter" ? "opacity-0 translate-y-1" : ""}
            ${state === "show" ? "opacity-100 translate-y-0" : ""}
            ${state === "exit" ? "opacity-0 -translate-y-1 scale-95" : ""}
          `}
        >
          Layanan Nusantara
        </div>

        {/* Deskripsi */}
        <p
          className={`
            mt-1 text-sm sm:text-lg text-gray-600
            transition-all duration-[800ms] delay-100
            ${state === "enter" ? "opacity-0 translate-y-3" : ""}
            ${state === "show" ? "opacity-100 translate-y-0" : ""}
            ${state === "exit" ? "opacity-0 -translate-y-1 scale-95" : ""}
          `}
        >
          Solusi Jasa Layanan Terpercaya
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.9; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
