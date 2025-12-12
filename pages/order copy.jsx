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
  

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const servicesItems = ["Desain Grafis", "Web Development", "Preset Fotografi",];

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

   if (name.trim().length < 3) {
  return setError("Nama harus berisi setidaknya 3 karakter.");
}
if (!phone.match(/^08\d{8,}$/)) {
  return setError("Nomor HP tidak valid. Gunakan format 08xxxxxxxxxx.");
}
if (!selectedService) {
  return setError("Silakan pilih layanan terlebih dahulu.");
}
if (selectedSubService === "Lainnya" && customSubService.trim().length < 3) {
  return setError("Tulis detail layanan jika memilih 'Lainnya'.");
}
if (!budget.match(/^\d{1,3}(\.\d{3})*$/)) {
  return setError("Budget harus berupa angka dengan format yang benar, contoh: 150.000.");
}
if (!deadline || new Date(deadline) <= new Date()) {
  return setError("Deadline harus ditetapkan setidaknya H+1 dari hari ini.");
}
if (message.trim().length < 10) {
  return setError("Pesan terlalu singkat. Tulis setidaknya 10 karakter.");
}
if (!paymentMethod) {
  return setError("Pilih metode pembayaran terlebih dahulu.");
}


    setError("");
    setIsSubmitting(true);

    const waNumber = "6287860592111";
    const detailService = selectedSubService === "Lainnya" ? customSubService : selectedSubService;

    const encodedMessage = encodeURIComponent(
      `*Hai Layanan Nusantara!* 👋✨\n\n` +
      `Saya sangat tertarik menggunakan jasa Layanan Nusantara. Berikut adalah detail lengkap pesanan saya:\n\n` +
      `👤 *Nama:* ${name}\n` +
      `📞 *Nomor WhatsApp:* ${phone}\n` +
      `🛠️ *Layanan yang Dipilih:* ${selectedService}${detailService ? ` - ${detailService}` : ""}\n` +
      `💰 *Budget yang Disediakan:* Rp ${budget}\n` +
      `⏰ *Deadline Pengerjaan:* ${deadline}\n` +
      `💳 *Metode Pembayaran:* ${paymentMethod}\n` +
      `📝 *Pesan Tambahan:*\n${message}\n\n` +
      `🙏 Saya sangat berharap tim Layanan Nusantara bisa segera memproses pesanan saya. Terima kasih banyak atas perhatian dan respons cepatnya. Semoga hari Anda menyenangkan!\n\n` +
      `Salam hormat,\n${name}`
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
                    <label>Detail Layanan</label>
                    <select
                      value={selectedSubService}
                      onChange={(e) => setSelectedSubService(e.target.value)}
                      className="mt-2 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="">-- Pilih Detail Layanan --</option>
                      {serviceSubOptions[selectedService].map((subItem, idx) => (
                        <option key={idx} value={subItem}>
                          {subItem}
                        </option>
                      ))}
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
                    className="mt-2 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer text-gray-700 font-medium"
                    placeholder="Pilih tanggal deadline"
                    aria-label="Pilih tanggal deadline"
                  />
                </div>
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
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-2 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">-- Pilih Metode Pembayaran --</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="OVO">OVO</option>
                    <option value="GoPay">GoPay</option>
                    <option value="Dana">Dana</option>
                  </select>
                </div>
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
