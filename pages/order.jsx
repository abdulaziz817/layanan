// pages/order.jsx
// ✅ Versi FULL + Crypto Payment (auto update kurs) + FIX bug toFixed(null)
// ✅ Tambahan: hitung estimasi 1x (useMemo), label network jelas, reset network saat ganti coin,
// ✅ Copy button aman kalau address kosong, dan WA message konsisten.
// ✅ NEW: Validasi dengan highlight merah per field + scroll ke banner error + pesan "lihat ke atas"

import Head from "next/head";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function OrderForm() {
  const formatIDR = (n) => {
    const num = Number(n || 0);
    return num.toLocaleString("id-ID");
  };

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedSubService, setSelectedSubService] = useState("");
  const [customSubService, setCustomSubService] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [minDate, setMinDate] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [duration, setDuration] = useState("");
  const [durationPrice, setDurationPrice] = useState("");
  const [showQris, setShowQris] = useState(false);
  const [showGopay, setShowGopay] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [showBCA, setShowBCA] = useState(false);

  // ✅ NEW: field errors (biar input merah + teks kecil)
  const [fieldErrors, setFieldErrors] = useState({});

  // ✅ NEW: ref untuk auto scroll ke banner error
  const errorRef = useRef(null);

  // ✅ Tambahan untuk Crypto
  const [showCrypto, setShowCrypto] = useState(false);
  const [cryptoCoin, setCryptoCoin] = useState("USDT");
  const [cryptoNetwork, setCryptoNetwork] = useState("TRC20"); // khusus USDT
  const [cryptoRate, setCryptoRate] = useState(null); // IDR per 1 coin
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoError, setCryptoError] = useState("");

  // ✅ Wallet address (sesuaikan dengan punyamu)
  const CRYPTO_WALLETS = {
    USDT: {
      TRC20: "TWRsLhJDFTwiZF1bxTUBMGhKWfkvBNxVT5",
      BEP20: "0x10ba26d331F7D9BdaC445E0F3bF8eb4669E598Af",
    },
    BTC: {
      MAINNET: "bc1q5fmz2e96l9eaqgvnsvzu43sp7xrw8s8qqzfs85",
    },
    ETH: {
      MAINNET: "0x10ba26d331F7D9BdaC445E0F3bF8eb4669E598Af",
    },
    BNB: {
      BEP20: "0x10ba26d331F7D9BdaC445E0F3bF8eb4669E598Af",
    },
  };

  const appPrices = {
    ChatGPT: {
      "1 Bulan · Sharing · Non Garansi": "20000",
      "1 Bulan · Sharing · Stabil · Non Garansi": "22000",
      "1 Bulan · Sharing · Garansi": "32000",
      "3 Bulan · Sharing · Garansi": "56000",
    },

    "YouTube Premium": {
      "1 Bulan · Pribadi · Garansi": "35000",
      "1 Bulan · Keluarga · Sharing": "30000",
      "1 Bulan · Pelajar · Garansi": "26000",
      "1 Bulan · Pelajar · Non Garansi": "13000",
    },

    "Netflix Premium": {
      "7 Hari · Pribadi · 1 Perangkat": "26000",
      "1 Bulan · Pribadi · 1 Perangkat": "49000",
      "7 Hari · Sharing · 2 Perangkat": "24000",
      "1 Bulan · Sharing · 2 Perangkat": "40000",
      "1 Bulan · Semi Private · 2 Perangkat": "61000",
    },

    "Disney Hotstar": {
      "1 Bulan · Semua Perangkat": "20000",
      "1 Tahun · Semua Perangkat": "120000",
    },

    Vidio: {
      "1 Bulan · Sharing · HP Only · Garansi": "32000",
      "1 Bulan · Sharing · Semua Perangkat · Garansi": "44000",
      "1 Bulan · Pribadi · HP Only · Garansi": "51000",
      "1 Bulan · Pribadi · Semua Perangkat · Garansi": "71000",
      "1 Tahun · Pribadi · TV Only · Garansi": "10000",
    },

    WeTV: {
      "1 Bulan · Sharing · 6 Orang": "18000",
      "1 Bulan · Sharing · 3 Orang": "24000",
      "1 Bulan · Pribadi · Garansi": "59000",
    },

    iQIYI: {
      "1 Bulan · Sharing · Paket Basic": "15000",
      "1 Bulan · Sharing · Paket Lengkap": "20000",
    },

    "Bstation Premium": {
      "1 Bulan · Sharing · Paket Basic": "15000",
      "1 Bulan · Sharing · Paket Lengkap": "27000",
    },

    Youku: {
      "1 Bulan · Sharing": "16000",
      "1 Tahun · Sharing": "32000",
    },

    "Viu Anlim": {
      "1 Bulan · Pribadi": "4000",
      "1 Tahun · Pribadi": "6000",
      "Lifetime · Pribadi": "8000",
    },

    HBO: {
      "1 Bulan · Sharing": "27000",
      "1 Tahun · Sharing": "33000",
    },

    Loklok: {
      "1 Bulan · Sharing · Paket Basic": "40000",
      "1 Bulan · Sharing · Paket Standar": "44000",
    },

    Fizzo: {
      "1 Tahun · Sharing": "28000",
    },

    Wibuku: {
      "1 Bulan · Sharing": "25000",
    },

    "Drakor ID": {
      "1 Bulan · Sharing": "15000",
    },

    Dramabox: {
      "1 Bulan · Sharing": "25000",
    },

    Iqiyl: {
      "1 Bulan · Sharing": "17000",
      "1 Tahun · Sharing": "34000",
    },

    "Prime Video": {
      "1 Bulan · Sharing · Semua Perangkat": "12000",
      "1 Bulan · Pribadi · Semua Perangkat": "26000",
    },

    Melolo: {
      "1 Bulan · Sharing": "16000",
    },

    Duolingo: {
      "1 Bulan · Premium": "14000",
    },

    "Perplexity AI": {
      "1 Bulan · Sharing": "11000",
    },

    "Express VPN": {
      "1 Bulan · Pribadi": "15000",
    },

    "Viu Premium": {
      "1 Bulan · Premium": "12000",
      "1 Tahun · Premium": "120000",
    },

    Spotify: {
      "1 Bulan · Pribadi · Garansi": "37000",
      "1 Bulan · Keluarga · Garansi": "32000",
      "1 Bulan · Pelajar · Garansi": "28000",
      "1 Bulan · Pelajar · Non Garansi": "15000",
    },

    "Canva Pro": {
      "1 Bulan · Member · Non Garansi": "15000",
      "1 Bulan · Member · Garansi": "25000",
      "Lifitime · Garansi 6 Bulan": "50000",
    },

    "CapCut Pro": {
      "7 Hari · Pribadi": "10000",
      "21 Hari · Pribadi": "18000",
      "35 Hari · Pribadi": "23000",
      "21 Hari · Sharing": "12000",
      "35 Hari · Sharing": "16000",
    },

    "Google Gemini": {
      "1 Tahun · Sharing": "25000",
    },

    Zoom: {
      "14 Hari · Pribadi": "14000",
    },

    "TikTok Premium": {
      "1 Bulan · Non Garansi": "15000",
      "1 Bulan · Garansi": "20000",
    },

    "HBO GO": {
      "1 Bulan · Garansi": "25000",
    },

    "Apple Music": {
      "1 Bulan · Invite Member": "10000",
    },

    "Alight Motion": {
      "1 Tahun · Generator · No Email": "4000",
      "1 Tahun · Email Pembeli · Garansi 6 Bulan": "8000",
      "1 Tahun · Email Seller · Garansi 6 Bulan": "12000",
    },

    Wink: {
      "7 Hari · Android · Akun Pembeli": "8000",
    },

    Meitu: {
      "7 Hari · Android · Akun Pembeli": "8000",
      "1 Bulan · Sharing · Akun Pembeli": "17000",
    },

    PicsArt: {
      "1 Bulan · Sharing": "6000",
      "1 Bulan · Private": "15000",
    },
  };

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // ✅ NEW: auto scroll ke banner error saat error muncul
  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [error]);

  // ✅ Reset durasi & harga kalau user ganti layanan utama
  useEffect(() => {
    setDuration("");
    setDurationPrice("");
  }, [selectedService]);

  // ✅ Reset durasi & harga kalau user ganti detail aplikasi
  useEffect(() => {
    setDuration("");
    setDurationPrice("");
  }, [selectedSubService]);

  // ✅ Kalau ganti coin/network, kosongkan error kurs
  useEffect(() => {
    setCryptoError("");
  }, [cryptoCoin, cryptoNetwork]);

  // ✅ Reset network USDT kalau pindah coin (biar state tidak nyangkut)
  useEffect(() => {
    if (cryptoCoin !== "USDT") setCryptoNetwork("TRC20");
  }, [cryptoCoin]);

  const servicesItems = [
    "Desain Grafis",
    "Web Development",
    "Preset Fotografi",
    "Aplikasi Premium",
  ];

  const serviceSubOptions = {
    "Desain Grafis": [
      "Desain Website",
      "Banner",
      "Poster",
      "Feed Instagram",
      "Story Instagram",
      "Logo",
      "Logo Animasi",
      "Kartu Nama",
      "Undangan Cetak",
      "Kemasan Produk",
      "Label Produk",
      "Stiker",
      "Sertifikat",
      "CV Kreatif",
      "Mockup Produk",
      "Brosur / Pamflet",
      "Thumbnail YouTube",
      "Highlight Instagram",
      "Flyer Digital",
      "Desain Kaos",
      "Desain Hoodie",
      "Template PowerPoint",
      "Desain Menu Makanan",
      "X-Banner",
      "Roll-Up Banner",
      "Infografis",
      "Desain Kartu Identitas",
      "Feed Carousel Instagram",
      "Desain Sampul Buku",
      "Desain Majalah",
      "Lainnya",
    ],

    "Web Development": [
      "Landing Page",
      "Company Profile",
      "E-Commerce",
      "Website Portfolio",
      "Blog Pribadi",
      "Website Sekolah",
      "Dashboard Admin",
      "Website Booking Online",
      "Website UMKM",
      "Web App Interaktif",
      "Toko Online",
      "Website Berita",
      "Sistem Akademik",
      "Website Pemerintahan",
      "Aplikasi Formulir Digital",
      "Aplikasi Multi-User",
      "Undangan Digital",
      "Sistem Absensi Online",
      "Web untuk Linktree",
      "Aplikasi Kalkulator Custom",
      "Sistem Layanan Jasa",
      "Website Katalog Produk",
      "Lainnya",
    ],

    "Preset Fotografi": [
      "Editing Foto",
      "Lightroom Preset",
      "Mobile Preset",
      "Preset Pernikahan",
      "Preset Luar Ruangan",
      "Preset Dalam Ruangan",
      "Preset Moody",
      "Preset Sinematik",
      "Preset Cerah & Lembut",
      "Preset Selfie",
      "Preset Pemandangan",
      "Preset Warna Kulit",
      "Preset Jam Emas",
      "Preset Potret",
      "Preset Perjalanan",
      "Preset Fotografi Makanan",
      "Preset Fashion",
      "Preset Tema Gelap",
      "Preset Hitam & Putih",
      "Preset Estetika Instagram",
      "Preset Gaya Perkotaan",
      "Preset Minimalis",
      "Preset Vlog",
      "Preset Bayi Baru Lahir",
      "Preset Matahari Terbenam",
      "Preset Flat Lay",
      "Lainnya",
    ],

    "Aplikasi Premium": [
      "🎬 Streaming Film",
      "Bstation Premium",
      "Disney Hotstar",
      "HBO GO",
      "HBO",
      "iQIYI",
      "Netflix Premium",
      "Prime Video",
      "Vidio",
      "Viu Premium",
      "Viu Anlim",
      "WeTV",
      "Youku",
      "Wibuku",
      "Dramabox",
      "Loklok",
      "Drakor ID",

      "🎵 Musik & Audio",
      "Apple Music",
      "Spotify",
      "Melolo",

      "🤖 AI",
      "ChatGPT",
      "Google Gemini",
      "Perplexity AI",

      "🎨 Desain & Editing",
      "Canva Pro",
      "CapCut Pro",
      "Alight Motion",
      "Wink",
      "Meitu",
      "PicsArt",

      "▶️ Video Premium",
      "TikTok Premium",
      "YouTube Premium",
      "Zoom",

      "📚 Aplikasi Lainnya",
      "Fizzo",
      "Duolingo",
      "Express VPN",
    ],
  };

  const formatRupiah = (value) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    const formatted = formatRupiah(value);
    setBudget(formatted);

    // ✅ hapus error field budget saat user ngetik
    setFieldErrors((prev) => ({ ...prev, budget: "" }));
  };

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Promo 40% 25 Des – 2 Jan (NOTE: ini di code kamu month===10, aku biarkan sesuai aslinya)
  const isPromo = (month === 10 && day >= 25) || (month === 1 && day <= 2);

  // ❄ Efek salju akhir tahun
  const isSnowEvent = (month === 12 && day >= 24) || (month === 1 && day <= 2);

  // ✅ Total IDR untuk konversi crypto
  const totalIDR = useMemo(() => {
    if (selectedService === "Aplikasi Premium") {
      return Number(durationPrice || 0);
    }
    return Number((budget || "").replace(/\./g, "") || 0);
  }, [selectedService, durationPrice, budget]);

  // ✅ Estimasi crypto dihitung 1x (FIX bug toFixed null / inconsistent)
  const estimatedCrypto = useMemo(() => {
    if (!cryptoRate || !totalIDR) return null;
    const amt = Number(totalIDR) / Number(cryptoRate);
    if (!isFinite(amt)) return null;
    return amt;
  }, [cryptoRate, totalIDR]);

  // ✅ Ambil kurs crypto → IDR (auto update) saat memilih Crypto
  useEffect(() => {
    if (!showCrypto) return;

    const mapId = {
      USDT: "tether",
      BTC: "bitcoin",
      BNB: "binancecoin",
      ETH: "ethereum",
    };

    const coinId = mapId[cryptoCoin] || "tether";
    let alive = true;

    const fetchRate = async () => {
      try {
        setCryptoLoading(true);
        setCryptoError("");

        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=idr`
        );

        const data = await res.json();
        const rate = data?.[coinId]?.idr;

        if (!alive) return;

        if (!rate) {
          throw new Error("Rate tidak ditemukan");
        }

        setCryptoRate(rate);
      } catch (err) {
        if (!alive) return;
        setCryptoError("Gagal ambil kurs crypto. Coba beberapa saat lagi.");
        setCryptoRate(null);
      } finally {
        if (!alive) return;
        setCryptoLoading(false);
      }
    };

    fetchRate();
    const t = setInterval(fetchRate, 30000); // refresh tiap 30 detik

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [showCrypto, cryptoCoin]);

  const getCryptoAddress = () => {
    if (cryptoCoin === "USDT") {
      return CRYPTO_WALLETS?.USDT?.[cryptoNetwork] || "";
    }
    if (cryptoCoin === "BTC") {
      return CRYPTO_WALLETS?.BTC?.MAINNET || "";
    }
    if (cryptoCoin === "ETH") {
      return CRYPTO_WALLETS?.ETH?.MAINNET || "";
    }
    if (cryptoCoin === "BNB") {
      return CRYPTO_WALLETS?.BNB?.BEP20 || "";
    }
    return "";
  };

  // ✅ Label network dibuat jelas (anti salah kirim)
  const getCryptoNetworkLabel = () => {
    if (cryptoCoin === "USDT") {
      return cryptoNetwork === "TRC20" ? "TRC20 (TRON)" : "BEP20 (BSC)";
    }
    if (cryptoCoin === "BTC") return "BTC (MAINNET)";
    if (cryptoCoin === "ETH") return "ETHEREUM (MAINNET)";
    if (cryptoCoin === "BNB") return "BSC (BEP20)";
    return "-";
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);

    setShowQris(method === "QRIS");
    setShowGopay(method === "GoPay");
    setShowPaypal(method === "PayPal");
    setShowBCA(method === "BCA");

    // ✅ Crypto toggle
    setShowCrypto(method === "Crypto");

    // ✅ hapus error paymentMethod saat user memilih
    setFieldErrors((prev) => ({ ...prev, paymentMethod: "" }));
  };

  // ✅ NEW: helper class untuk merah + helper hapus error per field
  const inputErrorClass =
    "border-red-400 focus:ring-red-400 focus:border-red-400";
  const baseSelectClass =
    "mt-2 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600";
  const baseSelectClassBig =
    "mt-2 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white shadow-sm text-sm";
  const baseTextareaClass =
    "w-full mt-2 h-32 px-3 py-2 border rounded-lg shadow-sm focus:border-indigo-600 focus:ring resize-none";
  const baseDateClass = "mt-2 w-full border rounded-lg p-3";

  const getClass = (base, key) =>
    `${base} ${fieldErrors?.[key] ? inputErrorClass : ""}`;

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev?.[key]) return prev;
      return { ...prev, [key]: "" };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fe = {};

    // VALIDASI UMUM
    if (name.trim().length < 3) fe.name = "Nama harus berisi setidaknya 3 karakter.";
    if (!phone.match(/^08\d{8,}$/))
      fe.phone = "Nomor HP tidak valid (gunakan format 08xxxxxxxxxx).";
    if (!selectedService) fe.selectedService = "Silakan pilih layanan terlebih dahulu.";

    if (selectedSubService === "Lainnya" && customSubService.trim().length < 3) {
      fe.customSubService = "Masukkan detail layanan jika memilih 'Lainnya' (min. 3 karakter).";
    }

    // KHUSUS "APLIKASI PREMIUM"
    if (selectedService === "Aplikasi Premium") {
      if (!selectedSubService) fe.selectedSubService = "Silakan pilih detail aplikasi terlebih dahulu.";
      if (!duration) fe.duration = "Silakan pilih durasi langganan.";
    } else {
      // VALIDASI NORMAL
      if (!budget.match(/^\d{1,3}(\.\d{3})*$/))
        fe.budget = "Budget harus format angka benar, contoh: 150.000.";
      if (!deadline || new Date(deadline) <= new Date())
        fe.deadline = "Deadline harus minimal 1 hari setelah tanggal hari ini.";
    }

    if (message.trim().length < 10)
      fe.message = "Pesan terlalu singkat. Tulis setidaknya 10 karakter.";
    if (!paymentMethod) fe.paymentMethod = "Pilih metode pembayaran terlebih dahulu.";

    // VALIDASI tambahan untuk Crypto
    if (paymentMethod === "Crypto") {
      const addr = getCryptoAddress();
      if (!addr) {
        fe.crypto = "Alamat wallet crypto belum diisi. Cek konfigurasi CRYPTO_WALLETS.";
      }
    }

    // jika ada error
    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);

      // ✅ banner global: “lihat ke atas”
      setError("Ada kesalahan pada pengisian form. Silakan periksa kolom yang ditandai merah.");
      return;
    }

    // Jika semua valid:
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const waNumber = "6287860592111";
    const detailService =
      selectedSubService === "Lainnya" ? customSubService : selectedSubService;

    const estimated = estimatedCrypto;

    const extraCryptoText =
      paymentMethod === "Crypto"
        ? `🪙 *Coin:* ${cryptoCoin}\n` +
          `🌐 *Network:* ${getCryptoNetworkLabel()}\n` +
          `🏦 *Alamat Wallet:* ${getCryptoAddress()}\n` +
          (cryptoRate
            ? `📈 *Kurs:* 1 ${cryptoCoin} = Rp ${Number(cryptoRate).toLocaleString("id-ID")}\n`
            : `📈 *Kurs:* (gagal diambil / belum tersedia)\n`) +
          (typeof estimated === "number"
            ? `💰 *Estimasi Bayar:* ${estimated.toFixed(6)} ${cryptoCoin}\n`
            : `💰 *Estimasi Bayar:* -\n`)
        : "";

    const encodedMessage = encodeURIComponent(
      `*Hai Layanan Nusantara!* 👋✨\n\n` +
        `Saya ingin memesan layanan berikut:\n\n` +
        `👤 *Nama:* ${name}\n` +
        `📞 *Nomor WhatsApp:* ${phone}\n` +
        `🛠️ *Layanan:* ${selectedService}${detailService ? ` - ${detailService}` : ""}\n` +
        `${
          selectedService === "Aplikasi Premium"
            ? `⏳ *Durasi Langganan:* ${duration}\n💰 *Harga:* Rp ${Number(durationPrice || 0).toLocaleString("id-ID")}\n`
            : `💰 *Budget:* Rp ${budget}\n⏰ *Deadline:* ${deadline}\n`
        }` +
        `💳 *Metode Pembayaran:* ${paymentMethod}\n` +
        (paymentMethod === "Crypto" ? `${extraCryptoText}` : "") +
        `📝 *Pesan Tambahan:* ${message}\n\n` +
        `Terima kasih!\n${name}`
    );

    setTimeout(() => {
      window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, "_blank");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Pesan Layanan</title>
        <style>{`
          .snow {
            pointer-events: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 9999;
          }

          .snow span {
            position: absolute;
            top: -10px;
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: fall linear infinite;
            opacity: 0.8;
          }

          @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(110vh) rotate(360deg); }
          }
        `}</style>
      </Head>

      {isSnowEvent && (
        <div className="snow">
          {Array.from({ length: 50 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: Math.random() * 100 + "%",
                animationDuration: 3 + Math.random() * 5 + "s",
                animationDelay: Math.random() * 5 + "s",
              }}
            ></span>
          ))}
        </div>
      )}

      <div className="pt-28 pb-12 bg-white min-h-screen">
        <div className="custom-screen text-gray-600">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white shadow-xl rounded-xl p-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                Pesan Layanan Kami
              </h1>
              <p className="mb-6 text-sm text-gray-500">
                Kirim pesanan kamu sekarang. Kami akan menghubungi via WhatsApp.
              </p>

              {error && (
                <motion.div
                  ref={errorRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-6 w-full text-center bg-red-50 text-red-700 border border-red-300 py-3 px-4 rounded-lg font-medium"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                <div>
                  <label>Nama Lengkap</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError("name");
                    }}
                    placeholder="Masukkan nama Anda"
                    className={`mt-2 ${fieldErrors?.name ? inputErrorClass : ""}`}
                  />
                  {fieldErrors?.name ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                  ) : null}
                </div>

                <div>
                  <label>Nomor HP (WhatsApp)</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldError("phone");
                    }}
                    placeholder="Contoh: 08xxxxxxxxxx"
                    className={`mt-2 ${fieldErrors?.phone ? inputErrorClass : ""}`}
                  />
                  {fieldErrors?.phone ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                  ) : null}
                </div>

                <div>
                  <label>Pilih Layanan</label>
                  <select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedSubService("");
                      setCustomSubService("");
                      clearFieldError("selectedService");
                      clearFieldError("selectedSubService");
                      clearFieldError("customSubService");
                      clearFieldError("duration");
                    }}
                    className={getClass(baseSelectClass, "selectedService")}
                  >
                    <option value="">-- Pilih Layanan --</option>
                    {servicesItems.map((item, idx) => (
                      <option key={idx} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {fieldErrors?.selectedService ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.selectedService}</p>
                  ) : null}
                </div>

                {selectedService && serviceSubOptions[selectedService] && (
                  <div>
                    <label className="font-semibold text-gray-800">Detail Layanan</label>
                    <select
                      value={selectedSubService}
                      onChange={(e) => {
                        setSelectedSubService(e.target.value);
                        clearFieldError("selectedSubService");
                        clearFieldError("customSubService");
                        clearFieldError("duration");
                      }}
                      className={getClass(
                        `
                        mt-2 w-full border border-gray-300 rounded-lg p-3
                        focus:outline-none focus:ring-2 focus:ring-indigo-600
                        bg-white shadow-sm text-sm
                      `,
                        "selectedSubService"
                      )}
                    >
                      <option value="" className="text-gray-400 italic">
                        -- Pilih Detail Layanan --
                      </option>

                      {serviceSubOptions[selectedService].map((subItem, idx) => {
                        const isCategory = [
                          "🎬 Streaming Film",
                          "🎵 Musik & Audio",
                          "🤖 AI",
                          "🎨 Desain & Editing",
                          "▶️ Video Premium",
                          "📚 Aplikasi Lainnya",
                        ].includes(subItem);

                        return (
                          <option
                            key={idx}
                            value={subItem}
                            disabled={isCategory}
                            className={
                              isCategory
                                ? `
                                  text-xs uppercase tracking-wide 
                                  bg-gradient-to-r from-indigo-100 to-indigo-50
                                  text-indigo-700 font-bold py-2 cursor-not-allowed
                                  border-t border-b border-indigo-200 mt-2
                                `
                                : `
                                  text-gray-900 pl-3
                                  hover:bg-indigo-50
                                `
                            }
                          >
                            {isCategory ? `── ${subItem} ──` : subItem}
                          </option>
                        );
                      })}
                    </select>

                    {fieldErrors?.selectedSubService ? (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.selectedSubService}</p>
                    ) : null}
                  </div>
                )}

                {selectedSubService === "Lainnya" && (
                  <div className="mt-3">
                    <label>Masukkan Detail Layanan</label>
                    <Input
                      type="text"
                      value={customSubService}
                      onChange={(e) => {
                        setCustomSubService(e.target.value);
                        clearFieldError("customSubService");
                      }}
                      placeholder="Contoh: Desain Feed Instagram"
                      className={`mt-2 ${fieldErrors?.customSubService ? inputErrorClass : ""}`}
                    />
                    {fieldErrors?.customSubService ? (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.customSubService}</p>
                    ) : null}
                  </div>
                )}

                {selectedService !== "Aplikasi Premium" && (
                  <>
                    <div>
                      <label>Budget (Rp)</label>
                      <Input
                        type="text"
                        value={budget}
                        onChange={handleBudgetChange}
                        placeholder="Contoh: 150.000"
                        className={`mt-2 ${fieldErrors?.budget ? inputErrorClass : ""}`}
                      />
                      {fieldErrors?.budget ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.budget}</p>
                      ) : null}
                    </div>

                    <div>
                      <label>Deadline (kapan selesai)</label>
                      <input
                        type="date"
                        min={minDate}
                        value={deadline}
                        onChange={(e) => {
                          setDeadline(e.target.value);
                          clearFieldError("deadline");
                        }}
                        className={getClass(baseDateClass, "deadline")}
                      />
                      {fieldErrors?.deadline ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.deadline}</p>
                      ) : null}
                    </div>
                  </>
                )}

                {selectedService === "Aplikasi Premium" && (
                  <>
                    <div className="mt-1">
                      <label className="font-semibold text-gray-800">Pilih Durasi</label>

                      <select
                        className={getClass(
                          `
                          mt-2 w-full p-3 border border-gray-300 rounded-lg
                          bg-white shadow-sm text-sm
                          focus:outline-none focus:ring-2 focus:ring-indigo-600
                        `,
                          "duration"
                        )}
                        value={duration}
                        onChange={(e) => {
                          const dur = e.target.value;
                          setDuration(dur);
                          clearFieldError("duration");

                          const raw = appPrices?.[selectedSubService]?.[dur] ?? 0;
                          const price = Number(raw) || 0;
                          const finalPrice = isPromo ? Math.round(price * 0.6) : price;
                          setDurationPrice(finalPrice);
                        }}
                        disabled={!selectedSubService || !appPrices?.[selectedSubService]}
                      >
                        <option value="">-- Pilih Durasi --</option>

                        {selectedSubService &&
                          appPrices?.[selectedSubService] &&
                          Object.keys(appPrices[selectedSubService]).map((dur) => (
                            <option key={dur} value={dur}>
                              {dur}
                            </option>
                          ))}
                      </select>

                      {fieldErrors?.duration ? (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.duration}</p>
                      ) : null}
                    </div>

                    {duration && (
                      <div className="relative w-full text-center space-y-2 py-3">
                        {isPromo && (
                          <div className="absolute right-2 top-2">
                            <span className="text-red-500 text-[11px] font-semibold bg-red-50 px-2 py-0.5 rounded">
                              40% OFF
                            </span>
                          </div>
                        )}

                        {isPromo && (
                          <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl mb-3 flex items-center gap-2">
                            <span className="text-2xl">🎅</span>
                            <div>
                              <p className="font-bold text-red-700">Event Akhir Tahun</p>
                              <p className="text-sm text-red-600 font-medium">
                                Berlaku: 25 Desember – 2 Januari
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-3 text-center">
                          {isPromo && (
                            <>
                              <p className="text-gray-400 text-sm line-through">
                                Rp{" "}
                                {Number(
                                  appPrices?.[selectedSubService]?.[duration] || 0
                                ).toLocaleString("id-ID")}
                              </p>
                              <p className="text-red-600 text-2xl font-bold">
                                Rp {Number(durationPrice || 0).toLocaleString("id-ID")}
                              </p>
                            </>
                          )}

                          {!isPromo && null}
                        </div>
                      </div>
                    )}

                    {/* PRICE CARD */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="
                        mt-6 rounded-2xl bg-white
                        border border-black/10
                        shadow-[0_14px_40px_rgba(0,0,0,0.10)]
                      "
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[11px] uppercase tracking-widest text-black/60 font-semibold">
                            Total Harga
                          </p>

                          <span className="rounded-full border border-indigo-600 px-3 py-1 text-[11px] font-bold text-indigo-600">
                            {isPromo ? "Promo 40%" : "Harga Normal"}
                          </span>
                        </div>

                        <div className="mt-2">
                          <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black">
                            Rp{" "}
                            {duration
                              ? Number(durationPrice || 0).toLocaleString("id-ID")
                              : "-"}
                          </p>

                          {isPromo && duration && selectedSubService && (
                            <p className="mt-1 text-sm text-black/40 line-through">
                              Rp{" "}
                              {Number(
                                appPrices?.[selectedSubService]?.[duration] || 0
                              ).toLocaleString("id-ID")}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-black/60">
                            {duration ? `Durasi: ${duration}` : "Pilih durasi untuk melihat harga"}
                          </p>
                        </div>

                        <div className="my-4 h-px w-full bg-black/10" />

                        <div className="flex flex-col gap-2 text-xs text-black/60 sm:flex-row sm:items-center sm:justify-between">
                          <span>Harga menyesuaikan durasi yang dipilih</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}

                <div>
                  <label>Pesan Tambahan</label>
                  <textarea
                    className={getClass(baseTextareaClass, "message")}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearFieldError("message");
                    }}
                    placeholder="Keterangan detail pesanan kamu..."
                  />
                  {fieldErrors?.message ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>
                  ) : null}
                </div>

                <div>
                  <label>Metode Pembayaran</label>
                  <select
                    className={getClass(
                      "mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600",
                      "paymentMethod"
                    )}
                    value={paymentMethod}
                    onChange={(e) => handlePaymentChange(e.target.value)}
                  >
                    <option value="">-- Pilih Metode Pembayaran --</option>
                    <option value="QRIS">QRIS</option>
                    <option value="BCA">Transfer Bank (BCA)</option>
                    <option value="GoPay">GoPay</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Crypto">Crypto (USDT/BTC/ETH/BNB)</option>
                  </select>
                  {fieldErrors?.paymentMethod ? (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.paymentMethod}</p>
                  ) : null}
                </div>

                {/* QRIS */}
                {showQris && (
                  <div className="mt-4 w-full p-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">QRIS Payment</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                          Secure
                        </span>
                      </div>

                      <span className="text-xs text-gray-500 mt-1">
                        Scan untuk melanjutkan pembayaran
                      </span>

                      <div className="mt-5 p-4 rounded-2xl bg-gray-50 border w-48 h-48 flex items-center justify-center shadow-inner">
                        <img
                          src="/image/qiris.jpg"
                          alt="QRIS"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>

                      <a
                        href="/image/qiris.jpg"
                        download
                        className="mt-6 w-full text-center py-2.5 text-[15px] font-medium rounded-xl bg-gray-900 text-white hover:bg-black transition-all active:scale-[0.98] shadow-md"
                      >
                        Download QR
                      </a>

                      <p className="text-[11px] text-gray-400 mt-3">
                        Pastikan QR terlihat jelas sebelum di-scan
                      </p>
                    </div>
                  </div>
                )}

                {/* GoPay */}
                {showGopay && (
                  <div className="mt-4 w-full p-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">GoPay Payment</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                          Secure
                        </span>
                      </div>

                      <span className="text-xs text-gray-500 mt-1">
                        Transfer ke nomor GoPay berikut
                      </span>

                      <div className="mt-5 w-full p-4 rounded-xl bg-gray-50 border flex justify-between items-center">
                        <span className="font-semibold text-gray-900 text-base">087860592111</span>

                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText("087860592111")}
                          className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition active:scale-[0.97]"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-3">
                        Pastikan nomor benar sebelum transfer
                      </p>
                    </div>
                  </div>
                )}

                {/* Paypal */}
                {showPaypal && (
                  <div className="mt-6 w-full max-w-md mx-auto p-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">Paypal Payment</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                          Secure
                        </span>
                      </div>

                      <span className="text-xs text-gray-500">
                        Kirim pembayaran ke email berikut
                      </span>

                      <div className="mt-4 w-full p-4 rounded-xl bg-gray-50 border flex justify-between items-center gap-3">
                        <span className="font-semibold text-gray-900 text-sm sm:text-base break-all">
                          zizzzzdul@gmail.com
                        </span>

                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText("zizzzzdul@gmail.com")}
                          className="text-sm px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition active:scale-95 whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-2">
                        Pastikan email benar sebelum kirim
                      </p>
                    </div>
                  </div>
                )}

                {/* BCA */}
                {showBCA && (
                  <div className="mt-4 w-full p-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">BCA Transfer</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                          Secure
                        </span>
                      </div>

                      <span className="text-xs text-gray-500 mt-1">
                        Transfer melalui bank BCA ke nomor berikut
                      </span>

                      <div className="mt-5 w-full p-4 rounded-xl bg-gray-50 border flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 text-base">3780905904</p>
                          <p className="text-xs text-gray-500 -mt-0.5">a.n A***l A**z</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText("3780905904")}
                          className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition active:scale-[0.97]"
                        >
                          Copy
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-400 mt-3">
                        Gunakan transfer antar bank bila berbeda bank
                      </p>
                    </div>
                  </div>
                )}

                {/* ✅ CRYPTO */}
                {showCrypto && (
                  <div className="mt-4 w-full p-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">Crypto Payment</h3>
                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                          Auto Update
                        </span>
                      </div>

                      <span className="text-xs text-gray-500 mt-1 text-center">
                        Pilih coin, sistem akan menghitung estimasi jumlah crypto dari total (IDR).
                        Kurs akan di-refresh tiap 30 detik.
                      </span>

                      {/* pesan error crypto (kalau wallet kosong) */}
                      {fieldErrors?.crypto ? (
                        <div className="mt-4 w-full bg-red-50 border border-red-300 text-red-700 rounded-lg p-3 text-xs">
                          {fieldErrors.crypto}
                        </div>
                      ) : null}

                      {/* pilih coin */}
                      <div className="mt-4 w-full">
                        <label className="text-xs text-gray-600">Pilih Coin</label>
                        <select
                          className="mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600"
                          value={cryptoCoin}
                          onChange={(e) => {
                            setCryptoCoin(e.target.value);
                            clearFieldError("crypto");
                          }}
                        >
                          <option value="USDT">USDT</option>
                          <option value="BTC">BTC</option>
                          <option value="ETH">ETH</option>
                          <option value="BNB">BNB</option>
                        </select>
                      </div>

                      {/* pilih network khusus USDT */}
                      {cryptoCoin === "USDT" && (
                        <div className="mt-4 w-full">
                          <label className="text-xs text-gray-600">Pilih Network USDT</label>
                          <select
                            className="mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600"
                            value={cryptoNetwork}
                            onChange={(e) => setCryptoNetwork(e.target.value)}
                          >
                            <option value="TRC20">TRC20 (TRON)</option>
                            <option value="BEP20">BEP20 (BSC)</option>
                          </select>

                          <p className="mt-2 text-[11px] text-gray-400">
                            Pastikan network sama saat transfer. Salah network = dana bisa hilang.
                          </p>
                        </div>
                      )}

                      {/* total + kurs + estimasi */}
                      <div className="mt-4 w-full p-4 rounded-xl bg-gray-50 border space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total (IDR)</span>
                          <span className="font-semibold text-gray-900">
                            Rp {Number(totalIDR || 0).toLocaleString("id-ID")}
                          </span>
                        </div>

                        {!totalIDR && (
                          <p className="text-[11px] text-amber-600">
                            Isi budget / pilih durasi dulu supaya estimasi crypto muncul.
                          </p>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Kurs</span>
                          <span className="font-semibold text-gray-900">
                            {cryptoLoading
                              ? "Loading..."
                              : cryptoRate
                              ? `1 ${cryptoCoin} = Rp ${Number(cryptoRate).toLocaleString("id-ID")}`
                              : "-"}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estimasi Bayar</span>
                          <span className="font-bold text-gray-900">
                            {typeof estimatedCrypto === "number"
                              ? `${estimatedCrypto.toFixed(6)} ${cryptoCoin}`
                              : "-"}
                          </span>
                        </div>

                        {cryptoError && <p className="text-xs text-red-600">{cryptoError}</p>}

                        <p className="text-[11px] text-gray-400">
                          *Estimasi bisa berubah karena kurs real-time.*
                        </p>
                      </div>

                      {/* wallet address */}
                      <div className="mt-4 w-full p-4 rounded-xl bg-white border">
                        <p className="text-xs text-gray-500 mb-2">
                          Alamat Wallet ({cryptoCoin} - {getCryptoNetworkLabel()})
                        </p>

                        <div className="flex justify-between items-center gap-3">
                          <span className="font-semibold text-gray-900 text-sm break-all">
                            {getCryptoAddress() || "-"}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const addr = getCryptoAddress();
                              if (addr) navigator.clipboard.writeText(addr);
                            }}
                            disabled={!getCryptoAddress()}
                            className="text-sm px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Copy
                          </button>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-2">
                          Setelah transfer, kirim bukti & TXID/hash via WhatsApp.
                        </p>

                        <p className="text-[11px] text-gray-500 mt-2">
                          ⚠️ QR/Alamat crypto ini tidak bisa dibayar via QRIS/DANA/GoPay/Bank.
                          Pembayaran crypto hanya bisa dari wallet/exchange crypto.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold
                      transition-all duration-300 ease-in-out
                      hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-[2px]
                      active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl"></span>
                    <span className="relative z-10">
                      {isSubmitting ? "Mengirim..." : "Kirim Pesanan via WhatsApp"}
                    </span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>

        <div className="snow pointer-events-none"></div>
      </div>
    </>
  );
}
