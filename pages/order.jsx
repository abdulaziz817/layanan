
import Head from "next/head";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function OrderForm() {
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




  const appPrices = {
    "ChatGPT": {
      "1 Bulan (No Garansi)": "17000",
      "1 Bulan (Head No Garansi)": "20000",
      "1 Bulan (Full Garansi)": "30000",
      "3 Bulan (Full Garansi)": "54000"
    },
    "YouTube Premium": {
      "1 Bulan (IndPlan)": "35000",
      "1 Bulan (Family Plan)": "30000",
      "1 Bulan (Student)": "26000",
      "1 Bulan (Student No Garansi)": "13000"
    },
    "Netflix Premium": {
      "1 Bulan (Standard)": "25000",
      "1 Bulan (Ultimate)": "31000"
    },
    "Disney Hotstar": {
      "1 Bulan": "20000",
      "1 Tahun": "120000"
    },
    "Vidio": {
      "1 Bulan (Premier)": "25000",
      "1 Bulan (Champions)": "30000",
      "1 Tahun (Premier)": "150000"
    },
    "WeTV": {
      "1 Bulan (VIP)": "15000",
      "3 Bulan (VIP)": "40000"
    },
    "iQIYI": {
      "1 Bulan (Standard)": "15000",
      "1 Bulan (Premium)": "20000"
    },
    "Bstation Premium": {
      "1 Bulan (Garansi)": "12000",
      "1 Bulan (Full Garansi)": "18000"
    },
    "Viu Premium": {
      "1 Bulan": "12000",
      "1 Tahun": "120000"
    },
    "Spotify": {
      "1 Bulan (Premium)": "6000",
      "1 Bulan (Family Plan)": "10000",
      "1 Bulan (Student)": "5000"
    },
    "Canva Pro": {
      "1 Bulan (No Garansi)": "15000",
      "1 Bulan (Full Garansi)": "25000",
      "1 Tahun (Full Garansi)": "75000"
    },
    "CapCut Pro": {
      "1 Bulan (Full Garansi)": "18000"
    },
    "Google Gemini": {
      "1 Bulan (Full Garansi)": "25000"
    },
    "TikTok Premium": {
      "1 Bulan (No Garansi)": "15000",
      "1 Bulan (Full Garansi)": "20000"
    },

    "HBO GO": {
      "1 Bulan (Full Garansi)": "25000"
    },
    "Apple Music": {
      "1 Bulan (Student)": "6000",
      "1 Bulan (Individual)": "9000",
      "1 Bulan (Family)": "15000"
    }


  };



  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const servicesItems = ["Desain Grafis", "Web Development", "Preset Fotografi", "Aplikasi Premium"];

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
      "Lainnya"
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
      "Lainnya"
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
      "Lainnya"
    ],
    "Aplikasi Premium": [
      "🎬 Streaming Film",

      "Bstation Premium",
      "Disney Hotstar",
      "HBO GO",
      "iQIYI",
      "Netflix Premium",
      "Vidio",
      "Viu Premium",
      "WeTV",

      "🎵 Musik",
      "Apple Music",
      "Spotify",

      "🤖 AI",
      "ChatGPT",
      "Google Gemini",

      "🎨 Desain & Editing",
      "Canva Pro",
      "CapCut Pro",

      "▶️ Video Premium",
      "TikTok Premium",
      "YouTube Premium"
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // VALIDASI UMUM
    if (name.trim().length < 3) {
      return setError("Nama harus minimal 3 karakter.");
    }
    if (!phone.match(/^08\d{8,}$/)) {
      return setError("Nomor HP tidak valid (gunakan format 08xxxxxxxxxx).");
    }
    if (!selectedService) {
      return setError("Silakan pilih salah satu layanan.");
    }
    if (selectedSubService === "Lainnya" && customSubService.trim().length < 3) {
      return setError("Masukkan detail layanan jika memilih 'Lainnya'.");
    }

    // KHUSUS "APLIKASI PREMIUM"
    if (selectedService === "Aplikasi Premium") {
      if (!duration) {
        return setError("Silakan pilih durasi langganan.");
      }
    } else {
      // VALIDASI NORMAL (untuk layanan selain Aplikasi Premium)
      if (!budget.match(/^\d{1,3}(\.\d{3})*$/)) {
        return setError("Budget harus berupa angka dengan format benar, contoh: 150.000.");
      }
      if (!deadline || new Date(deadline) <= new Date()) {
        return setError("Deadline harus minimal 1 hari setelah tanggal hari ini.");
      }
    }

    if (message.trim().length < 10) {
      return setError("Pesan harus minimal 10 karakter.");
    }
    if (!paymentMethod) {
      return setError("Pilih metode pembayaran yang diinginkan.");
    }

    // Jika semua valid:
    setError("");
    setIsSubmitting(true);

    const waNumber = "6287860592111";
    const detailService =
      selectedSubService === "Lainnya" ? customSubService : selectedSubService;

    const encodedMessage = encodeURIComponent(
      `*Hai Layanan Nusantara!* 👋✨\n\n` +
      `Saya ingin memesan layanan berikut:\n\n` +
      `👤 *Nama:* ${name}\n` +
      `📞 *Nomor WhatsApp:* ${phone}\n` +
      `🛠️ *Layanan:* ${selectedService}${detailService ? ` - ${detailService}` : ""}\n` +
      `${selectedService === "Aplikasi Premium"
        ? `⏳ *Durasi Langganan:* ${duration}\n💰 *Harga:* Rp ${durationPrice}\n`
        : `💰 *Budget:* Rp ${budget}\n⏰ *Deadline:* ${deadline}\n`
      }` +
      `💳 *Metode Pembayaran:* ${paymentMethod}\n` +
      `📝 *Pesan Tambahan:* ${message}\n\n` +
      `Terima kasih!\n${name}`
    );

    setTimeout(() => {
      window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, "_blank");
      setIsSubmitting(false);
    }, 1000);
  };

  const handlePaymentChange = (method) => {
  setPaymentMethod(method);

  setShowQris(method === "QRIS");
  setShowGopay(method === "GoPay");
  setShowPaypal(method === "PayPal");
  setShowBCA(method === "BCA");
};


  return (
    <>
      <Head>
        <title>Pesan Layanan</title>
      </Head>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Pesan Layanan Kami</h1>
              <p className="mb-6 text-sm text-gray-500">
                Kirim pesanan kamu sekarang. Kami akan menghubungi via WhatsApp.
              </p>
              {error && (
                <motion.div
                  className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label>Nomor HP (WhatsApp)</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08xxxxxxxxxx"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label>Pilih Layanan</label>
                  <select
                    value={selectedService}
                    onChange={(e) => {
                      setSelectedService(e.target.value);
                      setSelectedSubService("");
                      setCustomSubService("");
                    }}
                    className="mt-2 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">-- Pilih Layanan --</option>
                    {servicesItems.map((item, idx) => (
                      <option key={idx} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedService && serviceSubOptions[selectedService] && (
                  <div>
                    <label className="font-semibold text-gray-800">Detail Layanan</label>
                    <select
                      value={selectedSubService}
                      onChange={(e) => setSelectedSubService(e.target.value)}
                      className="
    mt-2 w-full border border-gray-300 rounded-lg p-3
    focus:outline-none focus:ring-2 focus:ring-indigo-600
    bg-white shadow-sm text-sm
  "
                    >
                      <option value="" className="text-gray-400 italic">
                        -- Pilih Detail Layanan --
                      </option>

                      {/* Tambahan divider kategori */}
                      {serviceSubOptions[selectedService].map((subItem, idx) => {
                        const isCategory = [
                          "🎬 Streaming Film",
                          "🎵 Musik",
                          "🤖 AI",
                          "🎨 Desain & Editing",
                          "▶️ Video Premium"
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
                  </div>

                )}
                {selectedSubService === "Lainnya" && (
                  <div className="mt-3">
                    <label>Masukkan Detail Layanan</label>
                    <Input
                      type="text"
                      value={customSubService}
                      onChange={(e) => setCustomSubService(e.target.value)}
                      placeholder="Contoh: Desain Feed Instagram"
                      className="mt-2"
                    />
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
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <label>Deadline (kapan selesai)</label>
                      <input
                        type="date"
                        min={minDate}
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="mt-2 w-full border rounded-lg p-3"
                      />
                    </div>
                  </>
                )}
                {selectedService === "Aplikasi Premium" && (
                  <>
                    <label className="font-semibold text-gray-700">Pilih Durasi</label>

                    <select
                      className="
    w-full mt-2 p-3 border border-gray-300 rounded-lg
    bg-white shadow-sm text-sm
    focus:outline-none focus:ring-2 focus:ring-indigo-600
  "
                      value={duration}
                      onChange={(e) => {
                        const dur = e.target.value;
                        setDuration(dur);
                        setDurationPrice(appPrices[selectedSubService][dur] || "-");
                      }}
                    >
                      <option value="">-- Pilih Durasi --</option>

                      {selectedSubService &&
                        Object.keys(appPrices[selectedSubService]).map((dur) => (
                          <option key={dur} value={dur}>
                            {dur}
                          </option>
                        ))}
                    </select>

                    {/* 🔥 HARGA PREMIUM RINGAN */}
                    <div
                      className="mt-5 p-5 rounded-2xl border shadow
                 bg-gradient-to-br from-white to-blue-50
                 text-center animate-price"
                    >
                      <p className="text-sm tracking-wide text-gray-500 uppercase font-medium">
                        Harga
                      </p>

                      <p className="text-3xl font-bold mt-1 text-blue-700">
                        Rp{" "}
                        {durationPrice
                          ? durationPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                          : "-"}
                      </p>
                    </div>
                  </>
                )}


                <div>
                  <label>Pesan Tambahan</label>
                  <textarea
                    className="w-full mt-2 h-32 px-3 py-2 border rounded-lg shadow-sm focus:border-indigo-600 focus:ring resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Keterangan detail pesanan kamu..."
                  />
                </div>
                <div>
  <label>Metode Pembayaran</label>
  <select
    className="mt-2 w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-600"
    value={paymentMethod}
    onChange={(e) => handlePaymentChange(e.target.value)}
  >
    <option value="">-- Pilih Metode Pembayaran --</option>
    <option value="QRIS">QRIS</option>
    <option value="GoPay">GoPay</option>
    <option value="PayPal">PayPal</option>
    <option value="BCA">BCA</option>
  </select>
</div>

                  {showQris && (
                    <div className="
    mt-4 w-full p-6 rounded-2xl 
    border border-gray-100 
    shadow-sm bg-white
  ">
                      <div className="flex flex-col items-center">

                        {/* TITLE */}
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            QRIS Payment
                          </h3>
                          <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                            Secure
                          </span>
                        </div>

                        <span className="text-xs text-gray-500 mt-1">
                          Scan untuk melanjutkan pembayaran
                        </span>

                        {/* QR WRAPPER */}
                        <div className="
        mt-5 p-4 rounded-2xl bg-gray-50 border
        w-48 h-48 flex items-center justify-center
        shadow-inner
      ">
                          <img
                            src="/image/qiris.jpg"
                            alt="QRIS"
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>



                        {/* DOWNLOAD BUTTON */}
                        <a
                          href="/image/qiris.jpg"
                          download
                          className="
          mt-6 w-full text-center py-2.5 text-[15px] font-medium
          rounded-xl bg-gray-900 text-white
          hover:bg-black transition-all active:scale-[0.98]
          shadow-md
        "
                        >
                          Download QR
                        </a>

                        {/* FOOTNOTE */}
                        <p className="text-[11px] text-gray-400 mt-3">
                          Pastikan QR terlihat jelas sebelum di-scan
                        </p>

                      </div>
                    </div>
                  )}


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
                          <span className="font-semibold text-gray-900 text-base">
                            087860592111
                          </span>

                          <button
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

                  {showPaypal && (
                    <div className="mt-4 w-full p-6 rounded-2xl border border-gray-100 shadow-sm bg-white">
                      <div className="flex flex-col items-center">

                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">Paypal Payment</h3>
                          <span className="px-2 py-0.5 text-[10px] rounded-md bg-gray-100 text-gray-500">
                            Secure
                          </span>
                        </div>

                        <span className="text-xs text-gray-500 mt-1">
                          Kirim pembayaran ke email berikut
                        </span>

                        <div className="mt-5 w-full p-4 rounded-xl bg-gray-50 border flex justify-between items-center">
                          <span className="font-semibold text-gray-900 text-base">
                            yourpaypal@email.com
                          </span>

                          <button
                            onClick={() => navigator.clipboard.writeText("yourpaypal@email.com")}
                            className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-black transition active:scale-[0.97]"
                          >
                            Copy
                          </button>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-3">
                          Pastikan email benar sebelum kirim
                        </p>
                      </div>
                    </div>
                  )}


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
                            <p className="font-semibold text-gray-900 text-base">AKAN segera hadir</p>
                            <p className="text-xs text-gray-500 -mt-0.5">a.n Abdul Aziz</p>
                          </div>

                          <button
                            onClick={() => navigator.clipboard.writeText("1234567890")}
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


                  
                <div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold
             transition-all duration-300 ease-in-out
             hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-[2px]
             active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span
                      className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-xl"
                    ></span>
                    <span className="relative z-10">
                      {isSubmitting ? 'Mengirim...' : 'Kirim Pesanan via WhatsApp'}
                    </span>
                  </Button>

                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
