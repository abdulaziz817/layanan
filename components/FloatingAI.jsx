import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

/* ===================== LIGHTWEIGHT ANIMATION ===================== */
const popupVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 24,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo 👋\n\nSelamat datang di Layanan Nusantara AI.\nSaya siap membantu Anda seputar layanan, pemesanan, dan pembayaran.",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  /* ===================== QUICK REPLIES ===================== */
  const quickReplies = [
    {
      question: "Apa itu Layanan Nusantara?",
      answer:
        "Layanan Nusantara adalah platform digital yang menyediakan berbagai layanan seperti aplikasi premium, desain grafis, preset foto, dan pengembangan website.",
    },
    {
      question: "Cara pemesanan layanan",
      answer:
        "🔘 Klik tombol Pesan Layanan di halaman utama.\n\n" +
        "🖥️ Isi form pemesanan dengan data yang sesuai.\n\n" +
        "📦 Pilih jenis layanan:\n" +
        "• Aplikasi Premium → harga & durasi otomatis.\n" +
        "• Desain Grafis / Preset Foto / Web Development → isi budget & deadline.\n\n" +
        "💳 Pilih metode pembayaran dan lakukan transfer.\n\n" +
        "💬 Klik Kirim Pesanan via WhatsApp.\n\n" +
        "📱 Admin akan memverifikasi dan pesanan diproses.",
    },
    {
      question: "Jam operasional layanan",
      answer: "⏰ Layanan beroperasi setiap hari\nPukul 08.00 – 20.00 WIB.",
    },
    {
      question: "Metode pembayaran yang tersedia?",
      answer:
        "💳 Metode pembayaran:\n• QRIS\n• Transfer Bank (BCA)\n• GoPay\n• PayPal",
    },
  ];

  /* ===================== SEND MESSAGE ===================== */
  const sendMessage = (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    const matched = quickReplies.find((q) =>
      text.toLowerCase().includes(q.question.toLowerCase())
    );

    const reply = matched
      ? matched.answer
      : "❌ Maaf, Fitur ini belum tersedia.\nSilakan pilih tombol di bawah.";

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    }, 350);
  };

  return (
    <>
      {/* ===================== INTRO POPUP ===================== */}
      <AnimatePresence>
        {showIntro && !open && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-4 z-50 will-change-transform"
          >
            <div
              onClick={() => setOpen(true)}
              className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-md cursor-pointer"
            >
              💬 Chat Layanan Nusantara
              <div className="text-xs opacity-90">AI Assistant</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== FLOATING BUTTON ===================== */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white border-4 border-indigo-600 shadow-md flex items-center justify-center will-change-transform"
        >
          <HiOutlineChatBubbleLeftRight className="text-black text-2xl" />
        </motion.button>
      )}

      {/* ===================== CHAT BOX ===================== */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[480px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden will-change-transform"
          >
            {/* HEADER */}
            <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
              <span className="font-semibold">Layanan Nusantara AI</span>
              <button onClick={() => setOpen(false)}>
                <FiX size={22} />
              </button>
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg max-w-[85%] text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-100 ml-auto text-right"
                      : "bg-white mr-auto border"
                  }`}
                >
                  {msg.content.split("\n").map((line, idx) => (
                    <p key={idx} className="leading-relaxed text-gray-700">
                      {line || <span className="block h-2" />}
                    </p>
                  ))}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-2 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Tanya apa saja..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  onClick={() => sendMessage(input)}
                  className="bg-indigo-600 text-white px-4 rounded-lg"
                >
                  Kirim
                </button>
              </div>

              {/* QUICK BUTTONS */}
              <div className="flex gap-2 overflow-x-auto mt-2">
                {quickReplies.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(q.question)}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-xs whitespace-nowrap"
                  >
                    {q.question}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
