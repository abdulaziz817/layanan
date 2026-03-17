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
  const start = new Date("2026-03-16T00:00:00");
  const end = new Date("2026-03-22T23:59:59");
  return now >= start && now <= end;
}, []);

const discountMultiplier = 0.7; // 30% off
const discountLabel = "30% OFF";


  const IdulFitriDecor = () => {
  const stars = Array.from({ length: 10 });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-indigo-100/40 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-emerald-100/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute -top-6 right-6"
      >
        <div className="relative">
          <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
            <circle cx="42" cy="42" r="28" stroke="rgba(17,24,39,0.18)" strokeWidth="2" />
            <circle cx="52" cy="36" r="28" fill="white" />
            <circle cx="52" cy="36" r="28" stroke="rgba(17,24,39,0.06)" strokeWidth="2" />
          </svg>

          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-12 top-10"
          >
            <div className="h-10 w-7 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-indigo-200" />
            </div>
            <div className="mx-auto mt-1 h-6 w-px bg-gray-200" />
          </motion.div>
        </div>
      </motion.div>

      {stars.map((_, i) => (
        <motion.span
          key={i}
          className="absolute inline-block h-1.5 w-1.5 rounded-full bg-gray-400"
          style={{
            left: `${10 + i * 8}%`,
            top: `${8 + (i % 4) * 10}%`,
            opacity: 0.2,
          }}
          animate={{ opacity: [0.12, 0.35, 0.12], scale: [1, 1.4, 1] }}
          transition={{
            duration: 2 + (i % 3) * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
};

  // ✅ GATE PALING AWAL: PWA + event
  useEffect(() => {
    // wajib PWA
    if (!isPWA()) {
      router.replace("/");
      return;
    }

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
      "1 Hari · Sharing · 1 Perangkat": "10000",
      "7 Hari · Sharing · 2 Perangkat": "24000",
      "1 Bulan · Sharing · 2 Perangkat": "48000",
      "1 Bulan · Semi Private · 2 Perangkat": "64000",
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
    Fizzo: { "1 Tahun · Sharing": "28000" },
    Wibuku: { "1 Bulan · Sharing": "25000" },
    "Drakor ID": { "1 Bulan · Sharing": "15000" },

    Dramabox: { "1 Bulan · Sharing": "25000" },
    Iqiyl: { "1 Bulan · Sharing": "17000", "1 Tahun · Sharing": "34000" },
    "Prime Video": {
      "1 Bulan · Sharing · Semua Perangkat": "12000",
      "1 Bulan · Pribadi · Semua Perangkat": "26000",
    },
    Melolo: { "1 Bulan · Sharing": "16000" },
    Duolingo: { "1 Bulan · Premium": "14000" },
    "Perplexity AI": { "1 Bulan · Sharing": "11000" },
    "Express VPN": { "1 Bulan · Pribadi": "15000" },
    "Viu Premium": { "1 Bulan · Premium": "12000", "1 Tahun · Premium": "120000" },
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
    "Google Gemini": { "1 Tahun · Sharing": "25000" },
    Zoom: { "14 Hari · Pribadi": "14000" },
    "TikTok Premium": { "1 Bulan · Non Garansi": "15000", "1 Bulan · Garansi": "20000" },
    "HBO GO": { "1 Bulan · Garansi": "25000" },
    "Apple Music": { "1 Bulan · Invite Member": "10000" },
    "Alight Motion": {
      "1 Tahun · Generator · No Email": "4000",
      "1 Tahun · Email Pembeli · Garansi 6 Bulan": "8000",
      "1 Tahun · Email Seller · Garansi 6 Bulan": "12000",
    },
    Wink: { "7 Hari · Android · Akun Pembeli": "8000" },
    Meitu: { "7 Hari · Android · Akun Pembeli": "8000", "1 Bulan · Sharing · Akun Pembeli": "17000" },
    PicsArt: { "1 Bulan · Sharing": "6000", "1 Bulan · Private": "15000" },
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
  `Saya ingin melakukan pemesanan melalui promo Hari Raya Idul Fitri 🎉\n` +
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

      <div className="pt-28 pb-12 bg-white min-h-screen relative">
       <IdulFitriDecor />
        <div className="max-w-xl mx-auto px-4 text-gray-700">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-gray-200 rounded-2xl shadow-sm p-6 bg-white relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">Diskon Ramadhan</h1>

          <p className="text-sm text-gray-500 mt-1">
Diskon <b>{discountLabel}</b> aktif <b>17 – 22 Mar 2026</b>.
</p>
              </div>

              <Link
                href="/profil?returnTo=/order/diskon"
                className="text-sm font-semibold text-indigo-700 hover:underline whitespace-nowrap"
              >
                Edit Profil
              </Link>
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
          </motion.div>
        </div>
      </div>
    </>
  );
}