import Head from "next/head";
import { isPWA } from "../../utils/isPWA";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Link from "next/link";

export default function OrderDiskonPage() {
  const router = useRouter();

  // ✅ gate allow render
  const [allow, setAllow] = useState(false);

  // user profile
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // form order
  const [message, setMessage] = useState("");
  const [selectedSubService, setSelectedSubService] = useState("");
  const [duration, setDuration] = useState("");
  const [durationPrice, setDurationPrice] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorRef = useRef(null);

  // payment
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showQris, setShowQris] = useState(false);
  const [showGopay, setShowGopay] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [showBCA, setShowBCA] = useState(false);

  // crypto
  const [showCrypto, setShowCrypto] = useState(false);
  const [cryptoCoin, setCryptoCoin] = useState("USDT");
  const [cryptoNetwork, setCryptoNetwork] = useState("TRC20");
  const [cryptoRate, setCryptoRate] = useState(null);
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoError, setCryptoError] = useState("");

const isDiskonEvent = useMemo(() => {
  const now = new Date();

  // mulai 14 Mei 2026
  const start = new Date("2026-05-14T00:00:00");

  // selesai 17 Mei 2026
  const end = new Date("2026-05-17T23:59:59");

  return now >= start && now <= end;
}, []);

  const discountMultiplier = 0.7; // 30% off
  const discountLabel = "30% OFF";


  const IdulFitriDecor = () => {
     const stars = Array.from({ length: 14 });

 return (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">

  {/* BACKGROUND */}
  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-white" />

  {/* GLOW */}
  <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-emerald-400/20 blur-3xl" />

  {/* ORNAMEN ISLAMI */}
  <div className="absolute top-0 left-0 w-full h-72 opacity-10">
    <svg
      viewBox="0 0 800 400"
      className="w-full h-full"
      fill="none"
    >
      <path
        d="M0 200Q100 100 200 200T400 200T600 200T800 200"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M0 240Q100 140 200 240T400 240T600 240T800 240"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  </div>

  {/* BULAN SABIT */}
  <div className="absolute top-10 right-6">
    <div className="relative w-28 h-28">

      <div className="absolute inset-0 rounded-full border-[6px] border-yellow-300 opacity-90" />

      <div className="absolute top-0 left-5 w-28 h-28 rounded-full bg-emerald-900" />

    </div>
  </div>

  {/* BINTANG */}
  {[...Array(20)].map((_, i) => (
    <div
      key={i}
      className="absolute bg-yellow-200 rounded-full animate-pulse"
      style={{
        width: `${2 + (i % 3)}px`,
        height: `${2 + (i % 3)}px`,
        top: `${5 + (i * 4)}%`,
        left: `${(i * 7) % 100}%`,
        opacity: 0.7,
      }}
    />
  ))}

  {/* LANTERN */}
  <div className="absolute top-24 left-6 opacity-80">
    <svg width="60" height="100" viewBox="0 0 60 100" fill="none">
      <line
        x1="30"
        y1="0"
        x2="30"
        y2="18"
        stroke="#fde68a"
        strokeWidth="2"
      />

      <rect
        x="15"
        y="18"
        width="30"
        height="45"
        rx="8"
        fill="#facc15"
      />

      <rect
        x="20"
        y="28"
        width="20"
        height="25"
        rx="4"
        fill="#fff7cc"
      />

      <line
        x1="20"
        y1="72"
        x2="40"
        y2="72"
        stroke="#fde68a"
        strokeWidth="3"
      />
    </svg>
  </div>

  {/* SILUET MASJID BAWAH */}
  <div className="absolute bottom-0 left-0 w-full opacity-[0.08]">
    <svg
      viewBox="0 0 1440 260"
      className="w-full h-auto fill-emerald-950"
    >
      <path d="M0 260V180H110V130C110 100 130 80 160 80C190 80 210 100 210 130V180H320V100L400 40L480 100V180H620V140C620 110 640 90 670 90C700 90 720 110 720 140V180H860V110L980 20L1100 110V180H1240V130C1240 100 1260 80 1290 80C1320 80 1340 100 1340 130V180H1440V260Z" />
    </svg>
  </div>

</div>
  );
};

  // ✅ GATE PALING AWAL: PWA + event
  useEffect(() => {
    // wajib PWA
    // if (!isPWA()) {
    //   router.replace("/");
    //   return;
    // }

    // wajib event diskon aktif
    if (!isDiskonEvent) {
      router.replace("/");
      return;
    }

    setAllow(true);
  }, [router, isDiskonEvent]);

  // gate: wajib login + profil lengkap (jalan hanya kalau allow true)
  useEffect(() => {
    if (!allow) return;

    const run = async () => {
      try {
        const res = await fetch("/api/user/auth/me");
        const data = await res.json();

        if (!data?.ok) {
          router.replace(`/login?returnTo=${encodeURIComponent("/order/diskon")}`);
          return;
        }

        if (!data?.user?.profile_completed) {
          router.replace(`/profil?returnTo=${encodeURIComponent("/order/diskon")}`);
          return;
        }

        setUser(data.user);
        setName(data.user?.name || "");
        setPhone(data.user?.phone || "");
      } catch (e) {
        router.replace(`/login?returnTo=${encodeURIComponent("/order/diskon")}`);
      } finally {
        setChecking(false);
      }
    };

    run();
  }, [allow, router]);

  // auto scroll error banner
  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [error]);

  // reset durasi & harga ketika ganti aplikasi
  useEffect(() => {
    setDuration("");
    setDurationPrice("");
  }, [selectedSubService]);

  // reset error crypto saat ganti coin/network
  useEffect(() => {
    setCryptoError("");
  }, [cryptoCoin, cryptoNetwork]);

  // reset network USDT default
  useEffect(() => {
    if (cryptoCoin !== "USDT") setCryptoNetwork("TRC20");
  }, [cryptoCoin]);

  // daftar harga aplikasi (normal)
  const appPrices = {
      "Vision+": {
  "1 Bulan · Sharing": "44000",
  "1 Bulan · Private": "76000",
},

"RCTI+": {
  "1 Bulan · Sharing": "38000",
  "1 Bulan · Private": "70000",
},

"Catchplay+": {
  "1 Hari · Sharing": "14000",
  "3 Hari · Sharing": "16000",
  "7 Hari · Sharing": "18000",
  "1 Bulan · Sharing": "24000",
  "1 Tahun · Sharing": "36000",
},

"Crunchyroll": {
  "1 Bulan · Sharing": "20000",
},

"MovieBox": {
  "1 Bulan · iOS": "20000",
},

"Gagaoalala": {
  "1 Hari · Sharing": "10000",
  "5 Hari · Sharing": "16000",
  "7 Hari · Sharing": "18000",
  "1 Bulan · Sharing": "24000",
},

/* 🎨 DESAIN & EDITING */
Polarr: {
  "1 Tahun · Sharing": "40000",
},

"Epik Pro": {
  "1 Tahun · Android Only": "40000",
},

Remini: {
  "1 Tahun · iOS": "54000",
},

IbisPaint: {
  "1 Tahun · Sharing": "40000",
},

Lightroom: {
  "1 Tahun · Sharing": "48000",
},

VSCO: {
  "1 Tahun · Android Only": "40000",
},

OldRoll: {
  "Lifetime · Android": "44000",
},

Procreate: {
  "Lifetime · iPhone": "44000",
  "Lifetime · iPad": "50000",
},

/* 📚 APLIKASI LAINNYA */
"Microsoft 365": {
  "1 Bulan · Family Plan": "50000",
},

GoodNotes: {
  "Lifetime · iPhone/iPad": "44000",
},

Kilonotes: {
  "Lifetime · iPhone/iPad": "44000",
},

GetContact: {
  "1 Bulan · Premium": "17000",
},


// BATAS REMINNI






    ChatGPT: {
      "1 Bulan · Sharing · Non Garansi": "20000",
      "1 Bulan · Private · Garansi": "32000",
      "3 Bulan · Sharing · Garansi": "56000",
    },
     "Claude AI": {
      "1 Bulan · Full Private · Garansi": "200000",
    },
         "Groq AI": {
      "1 Bulan · Private · Garansi": "25000",
    },

    "YouTube Premium": {
      "1 Bulan · Pribadi · Garansi": "35000",
      "1 Bulan · Keluarga · Sharing": "30000",
      "1 Bulan · Pelajar · Garansi": "26000",
      "1 Bulan · Pelajar · Non Garansi": "13000",
    },

    "Netflix Premium": {
     "1 Hari · Sharing · 1 Perangkat": "10000",
     "3 Hari · Sharing · 1 Perangkat": "15000",
     "7 Hari · Sharing · 1 Perangkat": "24000",
     "14 Hari · Sharing · 1 Perangkat": "35000",
     "1 Bulan · Sharing · 2 Perangkat": "48000",
     "1 Bulan · Semi Private": "64000",
     "2 Bulan · Semi Private": "870000",
     "3 Bulan · Semi Private": "120000",
    },

    "Disney Hotstar": {
      "1 Hari · Sharing · Garansi": "12000",
      "3 Hari · Sharing · Garansi": "15000",
      "5 Hari · Sharing · Garansi": "20000",
      "7 Hari · Sharing · Garansi": "25000",
      "1 Bulan · Sharing · Garansi": "40000",
      "1 Tahun · Sharing · Garansi": "120000",
    },

    Vidio: {
      "1 Bulan · Sharing · HP Only · Garansi": "32000",
      "1 Bulan · Sharing · Semua Perangkat · Garansi": "44000",
      "1 Bulan · Private · HP Only · Garansi": "51000",
      "1 Bulan · Private · Semua Perangkat · Garansi": "71000",
      "1 Tahun · Private · TV Only · Garansi": "10000",
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
      "1 Bulan · Sharing": "13000",
      "6 Bulan · Sharing": "21000",
      "1 Tahun · Sharing": "41000",

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
      "1 Bulan · Private": "23000",
      "1 Tahun · Private": "47000",

    },

    "Prime Video": {
      "1 Bulan · Sharing · Semua Perangkat": "12000",
      "1 Bulan · Private · Semua Perangkat": "26000",
    },

    Melolo: {
      "1 Bulan · Sharing": "16000",
    },

    Duolingo: {
      "14 Hari · Premium": "15000",
      "1 Bulan · Premium": "17000",
    },

    "Perplexity AI": {
      "1 Bulan · Sharing": "11000",
    },

    "Express VPN": {
      "1 Bulan · Private": "15000",
    },

    "Viu Premium": {
      "1 Bulan · Private": "12000",
      "1 Tahun · Private": "50000",
      "Lifitime · Private": "85000",

    },

    Spotify: {
      "3 Bulan · Pribadi · Garansi": "53000",
      "2 Bulan · Keluarga · Garansi": "36000",
      "1 Bulan · Pelajar · Garansi": "29000",
    },

    "Canva Pro": {
      "1 Bulan · Member · Non Garansi": "15000",
      "1 Bulan · Member · Garansi": "25000",
      "Lifitime · Garansi 6 Bulan": "50000",
    },

    "CapCut Pro": {
      "7 Hari · Private": "10000",
      "14 Hari · Private": "14000",
      "28 Hari · Private": "19000",
      "42 Hari · Private": "29000",
      "7  Bulan · Private · Garansi ": "49000",
    },

    "Google Gemini": {
      "3 Bulan · Sharing": "8000",
      "1 Tahun · Sharing": "25000",
      "3 Bulan · Private": "15000",
      "1 Tahun · Private": "50000",
    },

    Zoom: {
      "7 Hari · Private": "10000",
      "14 Hari · Private": "16000",
      "28 Hari · Private": "40000",

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
      "7 Hari · Android · Akun Penjual": "11000",

    },

    Meitu: {
      "7 Hari · Android · Akun Pembeli": "9000",
      "1 Bulan · Sharing · Akun Pembeli": "32000",
    },

    PicsArt: {
      "1 Bulan · Sharing": "6000",
      "1 Bulan · Private": "15000",
    },
  };

  // wallet crypto
  const CRYPTO_WALLETS = {
    USDT: {
      TRC20: "TWRsLhJDFTwiZF1bxTUBMGhKWfkvBNxVT5",
      BEP20: "0x10ba26d331F7D9BdaC445E0F3bF8eb4669E598Af",
    },
    BTC: { MAINNET: "bc1q5fmz2e96l9eaqgvnsvzu43sp7xrw8s8qqzfs85" },
    ETH: { MAINNET: "0x10ba26d331F7D9BdaC445E0F3bF8eb4669E598Af" },
    BNB: { BEP20: "0x10ba26d331F7D9BdaC445E0F3bF8eb4669E598Af" },
  };

  const getCryptoAddress = () => {
    if (cryptoCoin === "USDT") return CRYPTO_WALLETS?.USDT?.[cryptoNetwork] || "";
    if (cryptoCoin === "BTC") return CRYPTO_WALLETS?.BTC?.MAINNET || "";
    if (cryptoCoin === "ETH") return CRYPTO_WALLETS?.ETH?.MAINNET || "";
    if (cryptoCoin === "BNB") return CRYPTO_WALLETS?.BNB?.BEP20 || "";
    return "";
  };

  const getCryptoNetworkLabel = () => {
    if (cryptoCoin === "USDT") return cryptoNetwork === "TRC20" ? "TRC20 (TRON)" : "BEP20 (BSC)";
    if (cryptoCoin === "BTC") return "BTC (MAINNET)";
    if (cryptoCoin === "ETH") return "ETHEREUM (MAINNET)";
    if (cryptoCoin === "BNB") return "BSC (BEP20)";
    return "-";
  };

  // total untuk crypto
  const totalIDR = useMemo(() => Number(durationPrice || 0), [durationPrice]);

  const estimatedCrypto = useMemo(() => {
    if (!cryptoRate || !totalIDR) return null;
    const amt = Number(totalIDR) / Number(cryptoRate);
    if (!isFinite(amt)) return null;
    return amt;
  }, [cryptoRate, totalIDR]);

  // fetch kurs crypto
  useEffect(() => {
    if (!showCrypto) return;

    const mapId = { USDT: "tether", BTC: "bitcoin", BNB: "binancecoin", ETH: "ethereum" };
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
        if (!rate) throw new Error("Rate tidak ditemukan");

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
    const t = setInterval(fetchRate, 30000);

    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [showCrypto, cryptoCoin]);

  // payment handler
  const handlePaymentChange = (method) => {
    setPaymentMethod(method);

    setShowQris(method === "QRIS");
    setShowGopay(method === "GoPay");
    setShowPaypal(method === "PayPal");
    setShowBCA(method === "BCA");
    setShowCrypto(method === "Crypto");

    setFieldErrors((prev) => ({ ...prev, paymentMethod: "" }));
  };

  const inputErrorClass = "border-red-400 focus:ring-red-400 focus:border-red-400";
  const getClass = (base, key) => `${base} ${fieldErrors?.[key] ? inputErrorClass : ""}`;

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev?.[key]) return prev;
      return { ...prev, [key]: "" };
    });
  };

  // hitung harga saat pilih durasi
  const computePrice = (sub, dur) => {
    const raw = appPrices?.[sub]?.[dur] ?? 0;
    const base = Number(raw) || 0;
    if (!isDiskonEvent) return base;
    return Math.round(base * discountMultiplier);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fe = {};

    if (!selectedSubService) fe.selectedSubService = "Silakan pilih aplikasi terlebih dahulu.";
    if (!duration) fe.duration = "Silakan pilih durasi.";
    if (!message || message.trim().length < 10) fe.message = "Pesan minimal 10 karakter.";
    if (!paymentMethod) fe.paymentMethod = "Pilih metode pembayaran.";

    if (paymentMethod === "Crypto") {
      const addr = getCryptoAddress();
      if (!addr) fe.crypto = "Alamat wallet crypto belum diisi.";
    }

    if (!isDiskonEvent) {
      fe.diskon = "Diskon belum aktif / sudah berakhir. Halaman ini hanya untuk event diskon.";
    }

    if (Object.keys(fe).length > 0) {
      setFieldErrors(fe);
      setError("Ada kesalahan pada pengisian form. Silakan periksa kolom yang ditandai merah.");
      return;
    }

    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const waNumber = "6287860592111";

    const normalPrice = Number(appPrices?.[selectedSubService]?.[duration] || 0);
    const promoPrice = Number(durationPrice || 0);

    const extraCryptoText =
      paymentMethod === "Crypto"
        ? `🪙 *Coin:* ${cryptoCoin}\n` +
        `🌐 *Network:* ${getCryptoNetworkLabel()}\n` +
        `🏦 *Alamat Wallet:* ${getCryptoAddress()}\n` +
        (cryptoRate
          ? `📈 *Kurs:* 1 ${cryptoCoin} = Rp ${Number(cryptoRate).toLocaleString("id-ID")}\n`
          : `📈 *Kurs:* (gagal diambil / belum tersedia)\n`) +
        (typeof estimatedCrypto === "number"
          ? `💰 *Estimasi Bayar:* ${estimatedCrypto.toFixed(6)} ${cryptoCoin}\n`
          : `💰 *Estimasi Bayar:* -\n`)
        : "";

    // ⚠️ FIX BUG: kamu tulis diskonPrice tapi variabelnya gak ada → pakai promoPrice
    const encodedMessage = encodeURIComponent(
      `*Hai Layanan Nusantara!* 👋\n` +
      `Saya ingin melakukan pemesanan melalui Diskon Hari Raya Idul Adha 🎉\n` +
      `*Diskon Spesial: 30% OFF*\n\n` +

      `━━━━━━━━━━━━━━━━\n` +
      `📦 *Detail Pesanan*\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `👤 *Nama:* ${name}\n` +
      `📞 *Nomor WhatsApp:* ${phone}\n` +
      `📦 *Aplikasi:* ${selectedSubService}\n` +
      `⏳ *Durasi:* ${duration}\n\n` +

      `💸 *Harga Normal:* Rp ${normalPrice.toLocaleString("id-ID")}\n` +
      `🔥 *Harga Promo:* Rp ${promoPrice.toLocaleString("id-ID")}\n\n` +

      `💳 *Metode Pembayaran:* ${paymentMethod}\n` +
      (paymentMethod === "Crypto" ? `${extraCryptoText}` : "") +
      `📝 *Catatan:* ${message}\n` +
      `━━━━━━━━━━━━━━━━\n\n` +

      `Terima kasih 🙏\n${name}`
    );

    setTimeout(() => {
      window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, "_blank");
      setIsSubmitting(false);
    }, 700);
  };

  // ✅ RETURN: jangan bikin hook kondisional, lock UI di sini
  if (!allow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Mengalihkan...</p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-sm">Menyiapkan akun Anda...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Diskon Spesial - Layanan Nusantara</title>
      </Head>

     <div className="pt-28 pb-12 min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-[#f8faf8]">

  {/* DECOR */}
  <IdulFitriDecor />

  {/* GLOW */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-400/20 blur-3xl rounded-full pointer-events-none" />

  <div className="max-w-xl mx-auto px-4 relative z-10 text-gray-700">
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        rounded-[30px]
        border border-white/20
        bg-white/88
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.15)]
        overflow-hidden
      "
    >
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white overflow-hidden">

  {/* PATTERN */}
  <div className="absolute inset-0 opacity-10">
    <svg
      viewBox="0 0 800 300"
      className="w-full h-full"
      fill="none"
    >
      <path
        d="M0 150Q100 80 200 150T400 150T600 150T800 150"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M0 190Q100 120 200 190T400 190T600 190T800 190"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  </div>

  {/* BULAN */}
  <div className="absolute top-4 right-20 opacity-20">
    <div className="relative w-24 h-24">

      <div className="absolute inset-0 rounded-full border-[5px] border-yellow-200" />

      <div className="absolute left-4 top-0 w-24 h-24 rounded-full bg-emerald-700" />

    </div>
  </div>

  <div className="relative flex items-start justify-between gap-3">

    <div className="min-w-0">

      {/* BADGE */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold tracking-wide mb-4">

        <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />

        PROMO SPESIAL IDUL ADHA
      </div>

      {/* TITLE */}
      <h1 className="text-3xl font-black leading-tight">
        Diskon Idul Adha 🐐
      </h1>

      <p className="text-sm text-emerald-50/90 mt-2 leading-relaxed">
        Diskon <b>{discountLabel}</b> aktif
        selama <b>27 – 29 Mei 2026</b>.
      </p>

      <div className="flex items-center gap-2 mt-4 flex-wrap">

        <div className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-medium">
          Auto Apply
        </div>

        <div className="px-3 py-1 rounded-full bg-yellow-300 text-emerald-950 text-xs font-bold">
          Limited Event
        </div>

      </div>
    </div>

    <Link
      href="/profil?returnTo=/order/diskon"
      className="
        shrink-0
        px-4 py-2
        rounded-xl
        bg-white text-emerald-700
        text-sm font-bold
        shadow-lg
        hover:scale-105
        transition
      "
    >
      Edit Profil
    </Link>

  </div>
</div>

            {!isDiskonEvent ? (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg">
                Diskon sedang tidak aktif. Halaman ini hanya bisa checkout saat event diskon.
              </div>
            ) : (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-lg">
                Diskon aktif! Potongan otomatis diterapkan ke harga.
              </div>
            )}

            {error ? (
              <div
                ref={errorRef}
                className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg"
              >
                {error}
                {fieldErrors?.diskon ? <div className="mt-2 text-xs">{fieldErrors.diskon}</div> : null}
              </div>
            ) : null}
<div className="p-6">
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border overflow-hidden bg-gray-50 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No Avatar</span>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">{user?.name || "-"}</p>
                  <p className="text-xs text-gray-500">{user?.phone || "-"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-700">Pilih Aplikasi</label>
                <select
                  value={selectedSubService}
                  onChange={(e) => {
                    setSelectedSubService(e.target.value);
                    clearFieldError("selectedSubService");
                    clearFieldError("duration");
                  }}
                  className={getClass(
                    "mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600",
                    "selectedSubService"
                  )}
                >
                  <option value="">-- Pilih Aplikasi --</option>
                  {Object.keys(appPrices).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                {fieldErrors?.selectedSubService ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.selectedSubService}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm text-gray-700">Pilih Durasi</label>
                <select
                  value={duration}
                  onChange={(e) => {
                    const dur = e.target.value;
                    setDuration(dur);
                    clearFieldError("duration");

                    const final = computePrice(selectedSubService, dur);
                    setDurationPrice(final);
                  }}
                  disabled={!selectedSubService}
                  className={getClass(
                    "mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 disabled:opacity-50",
                    "duration"
                  )}
                >
                  <option value="">-- Pilih Durasi --</option>
                  {selectedSubService &&
                    Object.keys(appPrices[selectedSubService] || {}).map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                </select>
                {fieldErrors?.duration ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.duration}</p>
                ) : null}
              </div>

              <div className="border rounded-2xl p-4 bg-gray-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harga</span>
                  <span className="font-bold text-gray-900">
                    {duration ? `Rp ${Number(durationPrice || 0).toLocaleString("id-ID")}` : "-"}
                  </span>
                </div>

                {isDiskonEvent && duration && selectedSubService ? (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Normal</span>
                      <span className="line-through">
                        Rp {Number(appPrices[selectedSubService][duration] || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-700">
                      <span>Diskon ({discountLabel})</span>
                      <span>Rp {Number(durationPrice || 0).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-sm text-gray-700">Pesan Tambahan</label>
                <textarea
                  className={getClass(
                    "mt-2 w-full h-28 border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600",
                    "message"
                  )}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    clearFieldError("message");
                  }}
                  placeholder="Contoh: mau akun baru / extend / kirim email / dsb..."
                />
                {fieldErrors?.message ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm text-gray-700">Metode Pembayaran</label>
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

              {showQris && (
                <div className="mt-4 w-full p-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">QRIS Payment</h3>
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                        Secure
                      </span>
                    </div>

                    <span className="text-xs text-gray-500 mt-1">Scan untuk melanjutkan pembayaran</span>

                    <div className="mt-5 p-4 rounded-2xl bg-gray-50 border w-48 h-48 flex items-center justify-center shadow-inner">
                      <img src="/image/qiris.jpg" alt="QRIS" className="w-full h-full object-contain rounded-xl" />
                    </div>

                    <a
                      href="/image/qiris.jpg"
                      download
                      className="mt-6 w-full text-center py-2.5 text-[15px] font-medium rounded-xl bg-gray-900 text-white hover:bg-black transition-all active:scale-[0.98] shadow-md"
                    >
                      Download QR
                    </a>

                    <p className="text-[11px] text-gray-400 mt-3">Pastikan QR terlihat jelas sebelum di-scan</p>
                  </div>
                </div>
              )}

              {showGopay && (
                <div className="border rounded-2xl p-4">
                  <p className="font-semibold text-gray-900">GoPay</p>
                  <div className="mt-3 flex items-center justify-between gap-3 border rounded-xl p-3 bg-gray-50">
                    <span className="font-bold">087860592111</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText("087860592111")}
                      className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {showPaypal && (
                <div className="border rounded-2xl p-4">
                  <p className="font-semibold text-gray-900">PayPal</p>
                  <div className="mt-3 flex items-center justify-between gap-3 border rounded-xl p-3 bg-gray-50">
                    <span className="font-bold break-all">zizzzzdul@gmail.com</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText("zizzzzdul@gmail.com")}
                      className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {showBCA && (
                <div className="border rounded-2xl p-4">
                  <p className="font-semibold text-gray-900">BCA</p>
                  <div className="mt-3 flex items-center justify-between gap-3 border rounded-xl p-3 bg-gray-50">
                    <div>
                      <div className="font-bold">3780905904</div>
                      <div className="text-xs text-gray-500">a.n A***l A**z</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText("3780905904")}
                      className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {showCrypto && (
                <div className="border rounded-2xl p-4">
                  <p className="font-semibold text-gray-900">Crypto</p>
                  {fieldErrors?.crypto ? (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">
                      {fieldErrors.crypto}
                    </div>
                  ) : null}

                  <div className="mt-3">
                    <label className="text-xs text-gray-600">Pilih Coin</label>
                    <select
                      className="mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600"
                      value={cryptoCoin}
                      onChange={(e) => setCryptoCoin(e.target.value)}
                    >
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="BNB">BNB</option>
                    </select>
                  </div>

                  {cryptoCoin === "USDT" && (
                    <div className="mt-3">
                      <label className="text-xs text-gray-600">Network USDT</label>
                      <select
                        className="mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600"
                        value={cryptoNetwork}
                        onChange={(e) => setCryptoNetwork(e.target.value)}
                      >
                        <option value="TRC20">TRC20 (TRON)</option>
                        <option value="BEP20">BEP20 (BSC)</option>
                      </select>
                      <p className="mt-2 text-[11px] text-gray-500">
                        Pastikan network sama saat transfer. Salah network = dana bisa hilang.
                      </p>
                    </div>
                  )}

                  <div className="mt-3 border rounded-xl p-3 bg-gray-50 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total</span>
                      <span className="font-bold">Rp {Number(totalIDR || 0).toLocaleString("id-ID")}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Kurs</span>
                      <span className="font-semibold">
                        {cryptoLoading
                          ? "Loading..."
                          : cryptoRate
                            ? `1 ${cryptoCoin} = Rp ${Number(cryptoRate).toLocaleString("id-ID")}`
                            : "-"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Estimasi</span>
                      <span className="font-bold">
                        {typeof estimatedCrypto === "number" ? `${estimatedCrypto.toFixed(6)} ${cryptoCoin}` : "-"}
                      </span>
                    </div>

                    {cryptoError ? <p className="text-xs text-red-600">{cryptoError}</p> : null}
                    <p className="text-[11px] text-gray-500">Estimasi bisa berubah karena kurs real-time.</p>
                  </div>

                  <div className="mt-3 border rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Alamat Wallet ({cryptoCoin} - {getCryptoNetworkLabel()})
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold break-all">{getCryptoAddress() || "-"}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const addr = getCryptoAddress();
                          if (addr) navigator.clipboard.writeText(addr);
                        }}
                        disabled={!getCryptoAddress()}
                        className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-50"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-500">
                      Setelah transfer, kirim bukti & TXID/hash via WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isDiskonEvent}
                className="w-full mt-2 bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Pesanan Diskon via WhatsApp"}
              </button>
            </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}