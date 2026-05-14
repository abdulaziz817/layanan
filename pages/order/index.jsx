import Head from "next/head";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function OrderForm() {
  // ✅ Konstanta
  const NUSANTARA_FEE = 1500;
  const MIN_WEBDEV_BUDGET = 150000;



const MIN_VIDEO_MINUTES = 1;
const MIN_VIDEO_RATE = 15000; // minimal harga per menit


const [videoMinutes, setVideoMinutes] = useState("");
const [videoRate, setVideoRate] = useState(String(MIN_VIDEO_RATE));

const videoTotal = useMemo(() => {
  const minutes = Number(videoMinutes || 0);
  const rate = Number(videoRate || 0);
  return minutes * rate;
}, [videoMinutes, videoRate]);

  const formatIDR = (n) => {
    const num = Number(n || 0);
    return num.toLocaleString("id-ID");
  };

  // ✅ Domain (khusus Web Development)
  const [domainMode, setDomainMode] = useState("");
  // "custom" (domain berbayar) | "subdomain" (netlify/vercel)

  const [domainBase, setDomainBase] = useState(""); // contoh: tokokamu (tanpa .com)
  const [domainTld, setDomainTld] = useState(".site"); // default
  const [domainYears, setDomainYears] = useState("1"); // "1" | "2" | "3"
  const [domainStatus, setDomainStatus] = useState("");
  // "" | "checking" | "available" | "taken" | "unknown"

  const [domainAiSuggestion, setDomainAiSuggestion] = useState("");

  const [subdomainProvider, setSubdomainProvider] = useState("");
  // "netlify" | "vercel"
  const [subdomainLabel, setSubdomainLabel] = useState("");
  // contoh: tokokamu.netlify.app

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

  // ✅ Fee hanya untuk Web Development (HARUS setelah selectedService)
  const shouldApplyFee = selectedService === "Web Development";
  const serviceFee = shouldApplyFee ? NUSANTARA_FEE : 0;

  // ✅ NEW: field errors
  const [fieldErrors, setFieldErrors] = useState({});

  // ✅ NEW: ref untuk auto scroll ke banner error
  const errorRef = useRef(null);

  // ✅ Tambahan untuk Crypto
  const [showCrypto, setShowCrypto] = useState(false);
  const [cryptoCoin, setCryptoCoin] = useState("USDT");
  const [cryptoNetwork, setCryptoNetwork] = useState("TRC20");
  const [cryptoRate, setCryptoRate] = useState(null);
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

  // ✅ Domain gratis (subdomain)
  const FREE_DOMAINS = ["netlify.app", "vercel.app"];

  // ✅ Harga domain "wajar" per tahun (estimasi)
  const DOMAIN_BUSINESS = {
    ".store": 180000,
    ".shop": 160000,
    ".business": 210000,
    ".company": 200000,
    ".market": 230000,
    ".services": 260000,
    ".agency": 190000,
    ".solutions": 280000,
    ".enterprise": 320000,
    ".group": 170000,
    ".com": 150000,
".net": 170000,
".org": 160000,
".co": 300000,
".id": 220000,
  };

  const DOMAIN_TECH = {
    ".tech": 170000,
    ".dev": 190000,
    ".ai": 950000,
    ".io": 650000,
    ".cloud": 240000,
    ".app": 200000,
    ".digital": 180000,
    ".systems": 250000,
    ".network": 210000,
    ".software": 260000,
    ".xyz": 140000,
".app": 200000,
".cloud": 240000,
  };

  const DOMAIN_CREATIVE = {
    ".design": 280000,
    ".studio": 190000,
    ".art": 150000,
    ".media": 210000,
    ".graphics": 230000,
    ".creative": 260000,
    ".agency": 190000,
    ".digital": 180000,
    ".gallery": 170000,
    ".works": 160000,
    ".media": 210000,
".studio": 190000,
".art": 150000,
".co": 300000, // opsional, sering dipakai brand kreatif
  };

  const DOMAIN_PORTFOLIO = {
    ".portfolio": 220000,
    ".site": 140000,
    ".website": 180000,
    ".online": 150000,
    ".space": 160000,
    ".page": 130000,
    ".me": 170000,
    ".bio": 190000,
    ".name": 120000,
    ".pro": 210000,
    ".me": 170000,
".my.id": 120000,
".web.id": 120000,
".online": 150000,
".site": 140000,
".name": 120000,
  };

  const DOMAIN_PRICES = {
    ...DOMAIN_BUSINESS,
    ...DOMAIN_TECH,
    ...DOMAIN_CREATIVE,
    ...DOMAIN_PORTFOLIO,
  };

  const DOMAIN_GROUPS = [
    { label: "Bisnis", options: Object.keys(DOMAIN_BUSINESS) },
    { label: "Teknologi", options: Object.keys(DOMAIN_TECH) },
    { label: "Kreatif & Desain", options: Object.keys(DOMAIN_CREATIVE) },
    { label: "Portofolio", options: Object.keys(DOMAIN_PORTFOLIO) },
  ];

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

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // ✅ auto scroll ke banner error saat error muncul
  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [error]);

  // ✅ Reset durasi & harga kalau user ganti layanan utama
  useEffect(() => {
    setDuration("");
    setDurationPrice("");

    // ✅ reset domain kalau ganti layanan
    setDomainMode("");
    setDomainBase("");
    setDomainTld(".site");
    setDomainYears("1");
    setDomainStatus("");
    setDomainAiSuggestion("");
    setSubdomainProvider("");
    setSubdomainLabel("");

    setFieldErrors((prev) => ({
      ...prev,
      domainMode: "",
      domainBase: "",
      domainTld: "",
      domainYears: "",
      domainStatus: "",
      subdomainProvider: "",
      subdomainLabel: "",
    }));
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

  // ✅ Reset network USDT kalau pindah coin
  useEffect(() => {
    if (cryptoCoin !== "USDT") setCryptoNetwork("TRC20");
  }, [cryptoCoin]);

const servicesItems = [
  "Desain Grafis",
  "Web Development",
  "Editing Video",
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

    "Editing Video": [
  "Short Video",
  "Reels / TikTok",
  "YouTube Editing",
  "Video Promosi",
  "Video Produk",
  "Video Cinematic",
  "Video Wedding",
  "Video Company Profile",
  "Motion Graphic Sederhana",
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
  "Netflix Premium",
  "Disney Hotstar",
  "Prime Video",
  "Vidio",
  "Viu Premium",
  "Viu Anlim",
  "WeTV",
  "iQIYI",
  "Youku",
  "Loklok",
  "Drakor ID",
  "Vision+",
  "RCTI+",
  "Catchplay+",
  "Crunchyroll",
  "MovieBox",
  "Gagaoalala",
  "Bstation Premium",
  "Wibuku",
  "Dramabox",

  "🎵 Musik & Audio",
  "Spotify",
  "Apple Music",
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
  "Polarr",
  "Epik Pro",
  "Remini",
  "IbisPaint",
  "Lightroom",
  "VSCO",
  "OldRoll",
  "Procreate",

  "▶️ Video Premium",
  "YouTube Premium",
  "TikTok Premium",
  "Zoom",

  "📚 Aplikasi Lainnya",
  "Duolingo",
  "Microsoft 365",
  "GoodNotes",
  "Kilonotes",
  "GetContact",
  "Fizzo",
  "Express VPN"
]

  };

  const formatRupiah = (value) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    const formatted = formatRupiah(value);
    setBudget(formatted);
    setFieldErrors((prev) => ({ ...prev, budget: "" }));
  };

  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Promo 40% 25 Des – 2 Jan (NOTE: ini di code kamu month===10, aku biarkan sesuai aslinya)
  const isPromo = (month === 10 && day >= 25) || (month === 1 && day <= 2);

  // ❄ Efek salju akhir tahun
  const isSnowEvent = (month === 12 && day >= 24) || (month === 1 && day <= 2);

  // ✅ Helpers domain
  const sanitizeDomainBase = (s) => {
    return (s || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9-]/g, "");
  };

  const getDomainFull = () => {
    const base = sanitizeDomainBase(domainBase);
    if (!base || !domainTld) return "";
    return `${base}${domainTld}`;
  };

  const domainPricePerYear = useMemo(() => {
    return Number(DOMAIN_PRICES[domainTld] || 0);
  }, [domainTld]);

  const domainCost = useMemo(() => {
    if (selectedService !== "Web Development") return 0;
    if (domainMode !== "custom") return 0;
    const full = getDomainFull();
    if (!full) return 0;
    const years = Number(domainYears || 1);
    return Number(domainPricePerYear || 0) * Number(years || 1);
  }, [
    selectedService,
    domainMode,
    domainBase,
    domainTld,
    domainYears,
    domainPricePerYear,
  ]);

  // ✅ Total IDR untuk konversi crypto (sudah termasuk fee + domain kalau WebDev custom)
// ✅ Total IDR untuk konversi crypto (fee hanya WebDev + domain hanya WebDev custom)
const totalIDR = useMemo(() => {
  let base = 0;

  if (selectedService === "Aplikasi Premium") {
    base = Number(durationPrice || 0);
  } else if (selectedService === "Editing Video") {
    base = Number(videoTotal || 0);
  } else {
    base = Number((budget || "").replace(/\./g, "") || 0);
  }

  return Number(base || 0) + Number(serviceFee || 0) + Number(domainCost || 0);
}, [selectedService, durationPrice, videoTotal, budget, serviceFee, domainCost]);

  // ✅ Estimasi crypto dihitung 1x
  const estimatedCrypto = useMemo(() => {
    if (!cryptoRate || !totalIDR) return null;
    const amt = Number(totalIDR) / Number(cryptoRate);
    if (!isFinite(amt)) return null;
    return amt;
  }, [cryptoRate, totalIDR]);


  useEffect(() => {
  setDuration("");
  setDurationPrice("");
  setVideoMinutes("");
  setVideoRate(String(MIN_VIDEO_RATE));
}, [selectedSubService]);

  // ✅ Ambil kurs crypto → IDR (auto update)
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

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);

    setShowQris(method === "QRIS");
    setShowGopay(method === "GoPay");
    setShowPaypal(method === "PayPal");
    setShowBCA(method === "BCA");
    setShowCrypto(method === "Crypto");

    setFieldErrors((prev) => ({ ...prev, paymentMethod: "" }));
  };

  // ✅ helper class untuk merah
const inputErrorClass =
  "!border-red-400 focus:!ring-red-400 focus:!border-red-400";
  const baseSelectClass =
    "mt-2 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600";
  const baseSelectClassBig =
    "mt-2 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white shadow-sm text-sm";
  const baseTextareaClass =
    "w-full mt-2 h-32 px-3 py-2 border rounded-lg shadow-sm focus:border-indigo-600 focus:ring resize-none";
  const baseDateClass = "mt-2 w-full border rounded-lg p-3";

  const getClass = (base, key) => `${base} ${fieldErrors?.[key] ? inputErrorClass : ""}`;

  const clearFieldError = (key) => {
    setFieldErrors((prev) => {
      if (!prev?.[key]) return prev;
      return { ...prev, [key]: "" };
    });
  };

  // ✅ Domain checker via API (/pages/api/domain-check.js)
  const checkDomain = async () => {
    const full = getDomainFull();

    if (!full) {
      setDomainStatus("unknown");
      setFieldErrors((prev) => ({
        ...prev,
        domainBase: "Isi nama domain dulu. Contoh: tokokamu",
      }));
      return;
    }

    // validasi format domain
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(full)) {
      setDomainStatus("unknown");
      setFieldErrors((prev) => ({
        ...prev,
        domainBase: "Format domain tidak valid. Contoh: tokokamu + pilih ekstensi",
      }));
      return;
    }

    setDomainStatus("checking");

    try {
      const res = await fetch(`/api/domain-check?domain=${encodeURIComponent(full)}`);
      const data = await res.json();

      if (!data?.ok) {
        setDomainStatus("unknown");
        return;
      }

      setDomainStatus(data.status || "unknown");
    } catch (e) {
      setDomainStatus("unknown");
    }
  };

  const pickAiTld = () => {
    const sub = (selectedSubService || "").toLowerCase();

    // sederhana tapi berguna
    if (
      sub.includes("e-commerce") ||
      sub.includes("toko") ||
      sub.includes("umkm") ||
      sub.includes("company") ||
      sub.includes("profile") ||
      sub.includes("jasa")
    ) {
      setDomainAiSuggestion("Saran AI: domain bisnis cocok pakai .shop / .store / .business (atau .company).");
      setDomainTld(".shop");
      return;
    }

    if (sub.includes("portfolio") || sub.includes("blog") || sub.includes("pribadi") || sub.includes("linktree")) {
      setDomainAiSuggestion("Saran AI: portfolio cocok pakai .site / .online / .page / .portfolio.");
      setDomainTld(".site");
      return;
    }

    if (sub.includes("web app") || sub.includes("dashboard") || sub.includes("sistem") || sub.includes("aplikasi")) {
      setDomainAiSuggestion("Saran AI: proyek teknologi cocok pakai .dev / .app / .tech (kalau startup: .io / .ai).");
      setDomainTld(".dev");
      return;
    }

    setDomainAiSuggestion("Saran AI: paling aman pakai .site / .website (umum dan bagus).");
    setDomainTld(".site");
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  const fe = {};

  // VALIDASI UMUM
  if (name.trim().length < 3) {
    fe.name = "Nama harus berisi setidaknya 3 karakter.";
  }

  if (!phone.match(/^08\d{8,}$/)) {
    fe.phone = "Nomor HP tidak valid (gunakan format 08xxxxxxxxxx).";
  }

  if (!selectedService) {
    fe.selectedService = "Silakan pilih layanan terlebih dahulu.";
  }

  if (selectedService && serviceSubOptions[selectedService] && !selectedSubService) {
    fe.selectedSubService = "Silakan pilih detail layanan terlebih dahulu.";
  }

  if (selectedSubService === "Lainnya" && customSubService.trim().length < 3) {
    fe.customSubService =
      "Masukkan detail layanan jika memilih 'Lainnya' (min. 3 karakter).";
  }

  // =========================
  // VALIDASI KHUSUS PER LAYANAN
  // =========================

  // Aplikasi Premium
  if (selectedService === "Aplikasi Premium") {
    if (!selectedSubService) {
      fe.selectedSubService = "Silakan pilih detail aplikasi terlebih dahulu.";
    }

    if (!duration) {
      fe.duration = "Silakan pilih durasi langganan.";
    }
  }

  // Editing Video
  else if (selectedService === "Editing Video") {
    if (!selectedSubService) {
      fe.selectedSubService =
        "Silakan pilih detail editing video terlebih dahulu.";
    }

    const minutes = Number(videoMinutes || 0);
    const rate = Number(videoRate || 0);

    if (!videoMinutes || minutes < MIN_VIDEO_MINUTES) {
      fe.videoMinutes = `Minimal durasi editing adalah ${MIN_VIDEO_MINUTES} menit.`;
    }

    if (!videoRate || rate < MIN_VIDEO_RATE) {
      fe.videoRate = `Minimal harga per menit adalah Rp ${MIN_VIDEO_RATE.toLocaleString(
        "id-ID"
      )}.`;
    }

    if (!deadline || new Date(deadline) <= new Date()) {
      fe.deadline = "Deadline harus minimal 1 hari setelah tanggal hari ini.";
    }
  }

  // Baso Ikan Tuna
  else if (selectedService === "Baso Ikan Tuna") {
    if (!selectedSubService) {
      fe.selectedSubService = "Silakan pilih lokasi offline terlebih dahulu.";
    }
  }

  // Layanan biasa + Web Development
  else {
    if (!budget.match(/^\d{1,3}(\.\d{3})*$/)) {
      fe.budget = "Budget harus format angka benar, contoh: 150.000.";
    } else {
      const b = Number((budget || "").replace(/\./g, "") || 0);

      if (selectedService === "Web Development" && b < MIN_WEBDEV_BUDGET) {
        fe.budget = `Minimal budget Web Development adalah Rp ${MIN_WEBDEV_BUDGET.toLocaleString(
          "id-ID"
        )}.`;
      }
    }

    if (!deadline || new Date(deadline) <= new Date()) {
      fe.deadline = "Deadline harus minimal 1 hari setelah tanggal hari ini.";
    }

    // VALIDASI DOMAIN khusus Web Development
    if (selectedService === "Web Development") {
      if (!domainMode) {
        fe.domainMode =
          "Pilih metode domain: domain berbayar atau subdomain gratis.";
      }

      if (domainMode === "custom") {
        if (!sanitizeDomainBase(domainBase)) {
          fe.domainBase =
            "Isi nama domain (tanpa ekstensi), contoh: tokokamu";
        }

        if (!domainTld) {
          fe.domainTld =
            "Pilih ekstensi domain (.site/.shop/.dev/dll).";
        }

        if (!domainYears) {
          fe.domainYears = "Pilih durasi domain (1/2/3 tahun).";
        }

        if (domainStatus === "taken") {
          fe.domainStatus =
            "Domain sudah dipakai. Silakan pilih domain lain.";
        }

        if (domainStatus !== "available") {
          fe.domainStatus =
            "Silakan cek domain dulu sampai statusnya 'Tersedia'.";
        }
      }

      if (domainMode === "subdomain") {
        if (!subdomainProvider) {
          fe.subdomainProvider = "Pilih subdomain: Netlify atau Vercel.";
        }

        if (!subdomainLabel.trim()) {
          fe.subdomainLabel =
            "Isi nama subdomain (contoh: tokokamu.netlify.app).";
        }

        const lower = (subdomainLabel || "").trim().toLowerCase();
        if (
          lower &&
          !FREE_DOMAINS.some((d) => lower.endsWith(`.${d}`) || lower === d)
        ) {
          fe.subdomainLabel =
            "Subdomain harus berakhir dengan .netlify.app atau .vercel.app.";
        }
      }
    }
  }

  // VALIDASI TAMBAHAN
  if (message.trim().length < 10) {
    fe.message = "Pesan terlalu singkat. Tulis setidaknya 10 karakter.";
  }

  if (!paymentMethod) {
    fe.paymentMethod = "Pilih metode pembayaran terlebih dahulu.";
  }

  if (paymentMethod === "Crypto") {
    const addr = getCryptoAddress();
    if (!addr) {
      fe.crypto =
        "Alamat wallet crypto belum diisi. Cek konfigurasi CRYPTO_WALLETS.";
    }
  }

  // DEBUG sementara
  console.log("FIELD ERRORS:", fe);

  if (Object.keys(fe).length > 0) {
    setFieldErrors(fe);
    setError(
      "Ada kesalahan pada pengisian form. Silakan periksa kolom yang ditandai merah."
    );
    return;
  }

  // kalau valid
  setError("");
  setFieldErrors({});
  setIsSubmitting(true);

  const waNumber = "6287860592111";
  const detailService =
    selectedSubService === "Lainnya" ? customSubService : selectedSubService;

  const estimated = estimatedCrypto;

// ✅ ICON UNICODE (biar tidak rusak jadi kotak)
const ICON = {
  hello: "\u{1F44B}\u2728", // 👋✨
  person: "\u{1F464}", // 👤
  phone: "\u{1F4DE}", // 📞
  tool: "\u{1F6E0}\uFE0F", // 🛠️
  money: "\u{1F4B0}", // 💰
  receipt: "\u{1F9FE}", // 🧾
  total: "\u{1F4B5}", // 💵
  clock: "\u23F0", // ⏰
  card: "\u{1F4B3}", // 💳
  note: "\u{1F4DD}", // 📝
  pin: "\u{1F4CD}", // 📍
  globe: "\u{1F30D}", // 🌍
  pushpin: "\u{1F4CC}", // 📌
  calendar: "\u{1F4C5}", // 📅
  chart: "\u{1F4C8}", // 📈
  bank: "\u{1F3E6}", // 🏦
  coin: "\u{1FA99}", // 🪙
};

// ✅ Domain text (khusus Web Development)
const domainText =
  selectedService === "Web Development"
    ? domainMode === "custom"
      ? `${ICON.globe} *Domain:* ${getDomainFull()}\n` +
        `${ICON.pushpin} *Status Domain:* ${
          domainStatus === "available"
            ? "Tersedia"
            : domainStatus === "taken"
            ? "Sudah dipakai"
            : "Tidak diketahui"
        }\n` +
        `${ICON.receipt} *Harga Domain / Tahun:* Rp ${formatIDR(domainPricePerYear)}\n` +
        `${ICON.calendar} *Durasi Domain:* ${domainYears} tahun\n` +
        `💸 *Total Domain:* Rp ${formatIDR(domainCost)}\n`
      : domainMode === "subdomain"
      ? `${ICON.globe} *Domain:* ${subdomainLabel}\n` +
        `${ICON.pushpin} *Tipe:* Subdomain gratis (${subdomainProvider})\n`
      : ""
    : "";

// ✅ Crypto extra text (muncul kalau pilih Crypto)
const extraCryptoText =
  paymentMethod === "Crypto"
    ? `${ICON.coin} *Coin:* ${cryptoCoin}\n` +
      `🌐 *Network:* ${getCryptoNetworkLabel()}\n` +
      `${ICON.bank} *Alamat Wallet:* ${getCryptoAddress()}\n` +
      (cryptoRate
        ? `${ICON.chart} *Kurs:* 1 ${cryptoCoin} = Rp ${Number(cryptoRate).toLocaleString(
            "id-ID"
          )}\n`
        : `${ICON.chart} *Kurs:* (gagal diambil / belum tersedia)\n`) +
      (typeof estimated === "number"
        ? `${ICON.money} *Estimasi Bayar:* ${estimated.toFixed(6)} ${cryptoCoin}\n`
        : `${ICON.money} *Estimasi Bayar:* -\n`)
    : "";

// ✅ ENCODED MESSAGE (FINAL)
const encodedMessage = encodeURIComponent(
  `*Hai Layanan Nusantara!* ${ICON.hello}\n\n` +
    `Saya ingin memesan layanan berikut:\n\n` +
    `${ICON.person} *Nama:* ${name}\n` +
    `${ICON.phone} *Nomor WhatsApp:* ${phone}\n` +
    `${ICON.tool} *Layanan:* ${selectedService}${detailService ? ` - ${detailService}` : ""}\n` +
    (domainText ? domainText : "") +
    `${

      
      // 🍜 BASO IKAN TUNA
      selectedService === "Baso Ikan Tuna"
        ? `${ICON.pin} *Lokasi Offline:* ${detailService || "-"}\n` +
          `${ICON.money} *Harga:* Coming Soon\n`

      // 🎬 APLIKASI PREMIUM (TANPA FEE)
      : selectedService === "Aplikasi Premium"
        ? `⏳ *Durasi Langganan:* ${duration}\n` +
          `${ICON.money} *Harga:* Rp ${Number(durationPrice || 0).toLocaleString("id-ID")}\n` +
          `${ICON.total} *Total:* Rp ${Number(durationPrice || 0).toLocaleString("id-ID")}\n`

          : selectedService === "Editing Video"
  ? `🎬 *Durasi Video:* ${videoMinutes} menit\n` +
    `💸 *Harga per Menit:* Rp ${Number(videoRate || 0).toLocaleString("id-ID")}\n` +
    `💵 *Total:* Rp ${Number(videoTotal || 0).toLocaleString("id-ID")}\n` +
    `⏰ *Deadline:* ${deadline}\n`

      // 🖥 WEB DEVELOPMENT (PAKAI FEE + DOMAIN JIKA ADA)
      : selectedService === "Web Development"
        ? `${ICON.money} *Budget:* Rp ${budget}\n` +
          `${ICON.receipt} *Biaya Layanan Nusantara:* Rp ${NUSANTARA_FEE.toLocaleString("id-ID")}\n` +
          `${ICON.total} *Total (Budget + Fee + Domain jika ada):* Rp ${Number(totalIDR || 0).toLocaleString(
            "id-ID"
          )}\n` +
          `${ICON.clock} *Deadline:* ${deadline}\n`

      // ✨ LAYANAN LAIN (TANPA FEE)
      : `${ICON.money} *Budget:* Rp ${budget}\n` +
        `${ICON.total} *Total:* Rp ${Number((budget || "").replace(/\./g, "") || 0).toLocaleString("id-ID")}\n` +
        `${ICON.clock} *Deadline:* ${deadline}\n`
    }` +
    `${ICON.card} *Metode Pembayaran:* ${paymentMethod}\n` +
    (paymentMethod === "Crypto" ? `${extraCryptoText}` : "") +
    `${ICON.note} *Pesan Tambahan:* ${message}\n\n` +
    `Terima kasih!\n${name}`
);

// ✅ KIRIM KE WHATSAPP
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
         .video-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: #e5e7eb; /* gray-200 */
  outline: none;
}

/* track */
.video-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
}

/* thumb */
.video-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4f46e5; /* indigo-600 */
  cursor: pointer;
  margin-top: -5px;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
  transition: all 0.15s ease;
}

.video-range:hover::-webkit-slider-thumb {
  box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.12);
}

/* Firefox */
.video-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4f46e5;
  border: none;
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

                      clearFieldError("domainMode");
                      clearFieldError("domainBase");
                      clearFieldError("domainTld");
                      clearFieldError("domainYears");
                      clearFieldError("domainStatus");
                      clearFieldError("subdomainProvider");
                      clearFieldError("subdomainLabel");
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
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.selectedSubService}
                      </p>
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
                      <p className="mt-1 text-xs text-red-600">
                        {fieldErrors.customSubService}
                      </p>
                    ) : null}
                  </div>
                )}
{selectedService !== "Aplikasi Premium" &&
  selectedService !== "Baso Ikan Tuna" &&
  selectedService !== "Editing Video" && (
    <>
      {/* Budget */}
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

        {selectedService === "Web Development" && (
          <p className="mt-1 text-[11px] text-gray-500">
            Minimal budget Web Development: Rp {formatIDR(MIN_WEBDEV_BUDGET)}
          </p>
        )}
      </div>

      {/* Deadline */}
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

      {/* ✅ Domain Section khusus Web Development */}
      {selectedService === "Web Development" && (
        <div className="mt-2 space-y-3">
          <label className="font-semibold text-gray-800">Domain Website</label>

          <select
            value={domainMode}
            onChange={(e) => {
              setDomainMode(e.target.value);
              setDomainBase("");
              setDomainTld(".site");
              setDomainYears("1");
              setDomainStatus("");
              setDomainAiSuggestion("");
              setSubdomainProvider("");
              setSubdomainLabel("");

              clearFieldError("domainMode");
              clearFieldError("domainBase");
              clearFieldError("domainTld");
              clearFieldError("domainYears");
              clearFieldError("domainStatus");
              clearFieldError("subdomainProvider");
              clearFieldError("subdomainLabel");
            }}
            className={getClass(baseSelectClassBig, "domainMode")}
          >
            <option value="">-- Pilih Metode Domain --</option>
            <option value="custom">
              Domain berbayar (pilih ekstensi + durasi + cek)
            </option>
            <option value="subdomain">
              Domain gratis (netlify.app / vercel.app)
            </option>
          </select>

          {fieldErrors?.domainMode ? (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.domainMode}</p>
          ) : null}
        </div>
      )}

      {/* ✅ Biaya Layanan Nusantara: HANYA tampil kalau Web Development */}
      {selectedService === "Web Development" && (
        <div className="mt-2 w-full p-4 rounded-xl bg-gray-50 border">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Biaya Layanan Nusantara</span>
            <span className="font-semibold text-gray-900">
              Rp {formatIDR(NUSANTARA_FEE)}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-gray-400">
            Berlaku khusus untuk operasional dan proses pengerjaan layanan
            pembuatan website.
          </p>
        </div>
      )}
    </>
  )}

{selectedService === "Editing Video" && (
  <>
    {/* Durasi Video */}
    <div>
  <label className="font-semibold text-gray-800">Durasi Video</label>

  <div className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-5">
    <div className="relative pt-6">
      <div
        className={`absolute -top-3 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[11px] font-medium text-white shadow-sm ${
  videoMinutes ? "opacity-100" : "opacity-0"
}`}
        style={{
          left: `${(((Number(videoMinutes || MIN_VIDEO_MINUTES) - MIN_VIDEO_MINUTES) / (60 - MIN_VIDEO_MINUTES)) * 100)}%`,
        }}
      >
        {videoMinutes || MIN_VIDEO_MINUTES} menit
      </div>

      <input
        type="range"
        min={MIN_VIDEO_MINUTES}
        max={60}
        step={1}
        value={videoMinutes || MIN_VIDEO_MINUTES}
        onChange={(e) => {
          setVideoMinutes(e.target.value);
          clearFieldError("videoMinutes");
        }}
        onMouseUp={() => {
          setTimeout(() => setVideoMinutes((prev) => prev), 800);
        }}
        className="video-range w-full"
      />

      <div className="mt-3 flex items-center justify-between text-xs text-black/60">
        <span>{MIN_VIDEO_MINUTES} menit</span>
        <span>60 menit</span>
      </div>
    </div>
  </div>

  {fieldErrors?.videoMinutes ? (
    <p className="mt-1 text-xs text-red-600">{fieldErrors.videoMinutes}</p>
  ) : null}
</div>

    {/* Harga per Menit */}
   <div>
  <label>Harga per Menit (Rp)</label>
  <div className="mt-2 w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-700 cursor-not-allowed">
    Rp {formatIDR(videoRate)}
  </div>

  <p className="mt-1 text-[11px] text-gray-500">
    Harga per menit sudah ditetapkan.
  </p>
</div>

    {/* Deadline Editing Video */}
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

    {/* Estimasi Harga Editing Video */}
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.10)]">
      <p className="text-[11px] uppercase tracking-widest text-black/60 font-semibold">
        Estimasi Harga Editing Video
      </p>

      <p className="mt-3 text-3xl font-extrabold tracking-tight text-black">
        Rp {Number(videoTotal || 0).toLocaleString("id-ID")}
      </p>

      <p className="mt-2 text-xs text-black/60">
        {videoMinutes || MIN_VIDEO_MINUTES} menit × Rp{" "}
        {Number(videoRate || 0).toLocaleString("id-ID")} / menit
      </p>
    </div>
  </>
)}
                        {/* ✅ CUSTOM DOMAIN */}
                        {domainMode === "custom" && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500">
                              Domain dibeli sendiri (misal Hostinger/Namecheap/dll). Pilih ekstensi & durasi,
                              lalu cek ketersediaan.
                            </p>

                            {/* AI Suggestion */}
                            <div className="w-full p-3 rounded-xl bg-gray-50 border text-xs text-gray-700">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold">Pilihan dari AI</span>
                                <button
                                  type="button"
                                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition"
                                  onClick={pickAiTld}
                                >
                                  Pilihkan
                                </button>
                              </div>
                              <p className="mt-2">
                                {domainAiSuggestion || "Klik 'Pilihkan' untuk saran ekstensi domain sesuai kebutuhan."}
                              </p>
                            </div>

                            {/* base + tld + years */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-1">
                                <label className="text-xs text-gray-600">Nama Domain</label>
                                <Input
                                  type="text"
                                  value={domainBase}
                                  onChange={(e) => {
                                    setDomainBase(e.target.value);
                                    setDomainStatus("");
                                    clearFieldError("domainBase");
                                    clearFieldError("domainStatus");
                                  }}
                                  placeholder="contoh: tokokamu"
                                  className={`mt-2 ${fieldErrors?.domainBase ? inputErrorClass : ""}`}
                                />
                                {fieldErrors?.domainBase ? (
                                  <p className="mt-1 text-xs text-red-600">{fieldErrors.domainBase}</p>
                                ) : null}
                              </div>

                              <div className="sm:col-span-1">
                                <label className="text-xs text-gray-600">Ekstensi</label>
                                <select
                                  className={getClass(
                                    "mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600",
                                    "domainTld"
                                  )}
                                  value={domainTld}
                                  onChange={(e) => {
                                    setDomainTld(e.target.value);
                                    setDomainStatus("");
                                    clearFieldError("domainTld");
                                    clearFieldError("domainStatus");
                                  }}
                                >
                                  {DOMAIN_GROUPS.map((group) => (
                                    <optgroup key={group.label} label={group.label}>
                                      {group.options.map((tld) => (
                                        <option key={tld} value={tld}>
                                          {tld}
                                        </option>
                                      ))}
                                    </optgroup>
                                  ))}
                                </select>
                                {fieldErrors?.domainTld ? (
                                  <p className="mt-1 text-xs text-red-600">{fieldErrors.domainTld}</p>
                                ) : null}
                              </div>

                              <div className="sm:col-span-1">
                                <label className="text-xs text-gray-600">Durasi</label>
                                <select
                                  className={getClass(
                                    "mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600",
                                    "domainYears"
                                  )}
                                  value={domainYears}
                                  onChange={(e) => {
                                    setDomainYears(e.target.value);
                                    setDomainStatus("");
                                    clearFieldError("domainYears");
                                    clearFieldError("domainStatus");
                                  }}
                                >
                                  <option value="1">1 Tahun</option>
                                  <option value="2">2 Tahun</option>
                                  <option value="3">3 Tahun</option>
                                </select>
                                {fieldErrors?.domainYears ? (
                                  <p className="mt-1 text-xs text-red-600">{fieldErrors.domainYears}</p>
                                ) : null}
                              </div>
                            </div>

                            {/* Price card */}
                            <div className="mt-2 w-full p-4 rounded-xl bg-gray-50 border text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Domain</span>
                                <span className="font-semibold text-gray-900">{getDomainFull() || "-"}</span>
                              </div>

                              <div className="flex justify-between mt-1">
                                <span className="text-gray-600">Harga / tahun (estimasi)</span>
                                <span className="font-semibold text-gray-900">
                                  Rp {formatIDR(domainPricePerYear || 0)}
                                </span>
                              </div>

                              <div className="my-2 h-px w-full bg-black/10" />

                              <div className="flex justify-between">
                                <span className="text-gray-700 font-semibold">Total Domain ({domainYears} tahun)</span>
                                <span className="font-extrabold text-gray-900">
                                  Rp {formatIDR(domainCost || 0)}
                                </span>
                              </div>

                              <p className="mt-2 text-[11px] text-gray-500">
                                *Harga domain bisa berbeda tergantung tempat beli domain. Ini estimasi “wajar” per tahun.*
                              </p>
                            </div>

                            {/* cek domain */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={checkDomain}
                                className="mt-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition disabled:opacity-50"
                                disabled={!sanitizeDomainBase(domainBase) || domainStatus === "checking"}
                              >
                                {domainStatus === "checking" ? "Cek..." : "Cek Domain"}
                              </button>

                              <div className="mt-2 flex-1 text-xs text-gray-500 flex items-center">
                                {domainStatus === "available" && "✅ Tersedia"}
                                {domainStatus === "taken" && "❌ Sudah dipakai"}
                                {domainStatus === "unknown" && "⚠️ Tidak diketahui"}
                                {domainStatus === "checking" && "⏳ Mengecek..."}
                              </div>
                            </div>

                            {fieldErrors?.domainStatus ? (
                              <p className="mt-1 text-xs text-red-600">{fieldErrors.domainStatus}</p>
                            ) : null}

                            {domainStatus && (
                              <div
                                className={`mt-2 text-xs rounded-lg border p-3 ${
                                  domainStatus === "available"
                                    ? "bg-green-50 border-green-200 text-green-700"
                                    : domainStatus === "taken"
                                    ? "bg-red-50 border-red-200 text-red-700"
                                    : "bg-yellow-50 border-yellow-200 text-yellow-700"
                                }`}
                              >
                                {domainStatus === "checking" && "Sedang mengecek domain..."}
                                {domainStatus === "available" && "✅ Domain tersedia (kemungkinan belum terdaftar / belum dipakai)."}
                                {domainStatus === "taken" && "❌ Domain sudah terdaftar / dipakai."}
                                {domainStatus === "unknown" && "⚠️ Status tidak bisa dipastikan (coba cek lagi nanti)."}
                              </div>
                            )}
                          </div>
                        )}

                    {/* ✅ SUBDOMAIN GRATIS */}
{domainMode === "subdomain" && (
  <div className="space-y-2">
    <p className="text-xs text-gray-500">
      Dari kami hanya menyediakan subdomain gratis: <b>netlify.app</b> atau <b>vercel.app</b>.
    </p>

    <select
      value={subdomainProvider}
      onChange={(e) => {
        setSubdomainProvider(e.target.value);
        clearFieldError("subdomainProvider");
      }}
      className={getClass(baseSelectClassBig, "subdomainProvider")}
    >
      <option value="">-- Pilih Provider --</option>
      <option value="netlify">Netlify (netlify.app)</option>
      <option value="vercel">Vercel (vercel.app)</option>
    </select>

    {fieldErrors?.subdomainProvider ? (
      <p className="mt-1 text-xs text-red-600">{fieldErrors.subdomainProvider}</p>
    ) : null}

    <Input
      type="text"
      value={subdomainLabel}
      onChange={(e) => {
        setSubdomainLabel(e.target.value);
        clearFieldError("subdomainLabel");
      }}
      placeholder={
        subdomainProvider === "vercel"
          ? "contoh: tokokamu.vercel.app"
          : "contoh: tokokamu.netlify.app"
      }
      className={`mt-2 ${fieldErrors?.subdomainLabel ? inputErrorClass : ""}`}
    />

    {fieldErrors?.subdomainLabel ? (
      <p className="mt-1 text-xs text-red-600">{fieldErrors.subdomainLabel}</p>
    ) : null}
  </div>
)}

{/* ✅ Tutup Domain Section Web Development */}

{/* ✅ Biaya Layanan Nusantara: HANYA MUNCUL KALO WEB DEVELOPMENT */}

{selectedService === "Baso Ikan Tuna" && (
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
          Harga Baso Ikan Tuna
        </p>

        <span className="rounded-full border border-amber-500 px-3 py-1 text-[11px] font-bold text-amber-600">
          Coming Soon
        </span>
      </div>

      <div className="mt-2">
        <p className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black">
          Coming Soon
        </p>
        <p className="mt-2 text-xs text-black/60">
          Harga akan diumumkan segera. Pilih lokasi offline di detail layanan.
        </p>
      </div>

      <div className="my-4 h-px w-full bg-black/10" />

      <div className="flex flex-col gap-2 text-xs text-black/60 sm:flex-row sm:items-center sm:justify-between">
        <span>Mode: Offline</span>
        <span>{selectedSubService ? `Lokasi: ${selectedSubService}` : "Pilih lokasi dulu"}</span>
      </div>
    </div>
  </motion.div>
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
              <p className="text-sm text-red-600 font-medium">Berlaku: 25 Desember – 2 Januari</p>
            </div>
          </div>
        )}

        <div className="mt-3 text-center">
          {isPromo && (
            <>
              <p className="text-gray-400 text-sm line-through">
                Rp {Number(appPrices?.[selectedSubService]?.[duration] || 0).toLocaleString("id-ID")}
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
                            Rp {duration ? Number(durationPrice || 0).toLocaleString("id-ID") : "-"}
                          </p>

                          {isPromo && duration && selectedSubService && (
                            <p className="mt-1 text-sm text-black/40 line-through">
                              Rp {Number(appPrices?.[selectedSubService]?.[duration] || 0).toLocaleString("id-ID")}
                            </p>
                          )}

                      <p className="mt-4 text-xs text-black/60">
  {duration ? `Durasi: ${duration}` : "Pilih durasi untuk melihat harga"}
</p>
                        </div>

                        <div className="my-4 h-px w-full bg-black/10" />

                        <div className="flex flex-col gap-2 text-xs text-black/60 sm:flex-row sm:items-center sm:justify-between">
                          <span>Harga menyesuaikan durasi yang dipilih</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* info biaya layanan */}
                    
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

                      <span className="text-xs text-gray-500 mt-1">Scan untuk melanjutkan pembayaran</span>

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

                      <p className="text-[11px] text-gray-400 mt-3">Pastikan QR terlihat jelas sebelum di-scan</p>
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

                      <span className="text-xs text-gray-500 mt-1">Transfer ke nomor GoPay berikut</span>

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

                      <p className="text-[11px] text-gray-400 mt-3">Pastikan nomor benar sebelum transfer</p>
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

                      <span className="text-xs text-gray-500">Kirim pembayaran ke email berikut</span>

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

                      <p className="text-[11px] text-gray-400 mt-2">Pastikan email benar sebelum kirim</p>
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

                      <p className="text-[11px] text-gray-400 mt-3">Gunakan transfer antar bank bila berbeda bank</p>
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

                      {fieldErrors?.crypto ? (
                        <div className="mt-4 w-full bg-red-50 border border-red-300 text-red-700 rounded-lg p-3 text-xs">
                          {fieldErrors.crypto}
                        </div>
                      ) : null}

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

                        <p className="text-[11px] text-gray-400">*Estimasi bisa berubah karena kurs real-time.*</p>
                      </div>

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
                    <span className="relative z-10">{isSubmitting ? "Mengirim..." : "Kirim Pesanan via WhatsApp"}</span>
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

// ------------------------------
// ✅ FILE 2: pages/api/domain-check.js  (WAJIB ADA)
// ------------------------------
// Tempel file ini di: /pages/api/domain-check.js
//
// Fungsi: cek domain itu "taken" (sudah terdaftar) atau "available" (belum terdaftar)
// dengan RDAP publik (rdap.org). Kalau error/rate-limit -> "unknown".

/*
export default async function handler(req, res) {
  try {
    const domainRaw = String(req.query.domain || "").trim().toLowerCase();

    // basic sanitization: hanya huruf/angka/dot/dash
    const domain = domainRaw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const isValid = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain);

    if (!isValid) {
      return res
        .status(400)
        .json({ ok: false, status: "unknown", message: "Domain tidak valid." });
    }

    // timeout helper
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);

    // RDAP lookup
    const rdapUrl = `https://rdap.org/domain/${encodeURIComponent(domain)}`;
    const resp = await fetch(rdapUrl, {
      method: "GET",
      signal: controller.signal,
      headers: { accept: "application/rdap+json, application/json" },
      redirect: "follow",
    });

    clearTimeout(t);

    if (resp.status === 200) {
      return res.status(200).json({ ok: true, status: "taken" });
    }

    if (resp.status === 404) {
      return res.status(200).json({ ok: true, status: "available" });
    }

    // kadang 429/5xx
    return res.status(200).json({ ok: true, status: "unknown" });
  } catch (e) {
    return res.status(200).json({ ok: true, status: "unknown" });
  }
}
*/