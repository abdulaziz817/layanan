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
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo 👋\nSaya Nusantara AI.\nSiap membantu Anda seputar layanan, pemesanan, dan pembayaran.",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
      answer:
        "⏰ Layanan beroperasi setiap hari.\n🕘 08.00 – 20.00 WIB.\nPesan di luar jam kerja akan dibalas pada jam operasional.",
    },
    {
      question: "Metode pembayaran?",
      answer:
        "💳 Metode pembayaran:\n• QRIS\n• Transfer Bank (BCA)\n• GoPay\n• PayPal",
    },
  ];

  /* ===================== RESET CHAT ===================== */
  const resetChat = () => {
    if (isTyping) return; // ⛔ blokir reset saat AI mengetik
    setMessages([
      {
        role: "assistant",
        content: "Halo 👋\nSaya Nusantara AI.\nAda yang bisa saya bantu?",
      },
    ]);
  };

  /* ===================== SEND MESSAGE ===================== */
  const sendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    // tampilkan pesan user
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    // quick reply
    const matched = quickReplies.find((q) =>
      text.toLowerCase().includes(q.question.toLowerCase())
    );

    if (matched) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: matched.answer },
        ]);
        setIsTyping(false);
      }, 1000); // delay 1 detik
      return;
    }

    // panggil AI generic via Netlify Function
    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || "Tidak ada jawaban." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* ===================== INTRO ===================== */}
      <AnimatePresence>
        {showIntro && !open && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-4 z-50"
          >
            <div
              onClick={() => setOpen(true)}
              className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-md cursor-pointer"
            >
              💬 Chat Nusantara AI
              <div className="text-xs opacity-90">AI Assistant</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== FLOAT BUTTON ===================== */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white border-4 border-indigo-600 shadow-md flex items-center justify-center"
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
            className="fixed bottom-6 right-6 z-50 w-80 md:w-96 h-[480px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
{/* HEADER */}
<div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
  <div className="flex items-center gap-3">
    {/* Avatar */}
    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
      🤖
    </div>

    {/* Info */}
    <div className="leading-tight">
      <div className="flex items-center gap-1">
        <p className="font-semibold text-sm">Nusantara AI</p>

        {/* Blue Check ala IG */}
        <svg
          className="w-4 h-4 text-blue-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.5 12l-2.1 2.4.3 3.2-3.1.7-1.6 2.8-3-1.2-3 1.2-1.6-2.8-3.1-.7.3-3.2L1.5 12l2.1-2.4-.3-3.2 3.1-.7L8 2.9l3 1.2 3-1.2 1.6 2.8 3.1.7-.3 3.2L22.5 12z" />
          <path
            d="M10.2 13.9l-1.8-1.8-.9.9 2.7 2.7 5.4-5.4-.9-.9-4.5 4.5z"
            fill="#fff"
          />
        </svg>
      </div>

   <p className="text-[11px] opacity-90 flex items-center gap-2 leading-none">
  <span className="inline-flex items-center gap-1">
    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse align-middle" />
    <span className="leading-none">Online</span>
  </span>
  <span className="opacity-60">•</span>
  <span className="leading-none">v1.8</span>
</p>

    </div>
  </div>

  {/* Close */}
  <button
    onClick={() => setOpen(false)}
    className="hover:bg-white/20 p-1 rounded-md transition"
  >
    <FiX size={18} />
  </button>
</div>

            {/* CHAT AREA */}
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white ml-auto rounded-br-md"
                      : "bg-white text-gray-700 mr-auto border rounded-bl-md"
                  }`}
                >
                  {(msg.content || "").split("\n").map((line, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {line || <span className="block h-2" />}
                    </p>
                  ))}
                </div>
              ))}

              {isTyping && (
                <div className="bg-white mr-auto border px-4 py-2 rounded-2xl text-xs text-gray-500 flex gap-1">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce delay-150">•</span>
                  <span className="animate-bounce delay-300">•</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  disabled={isTyping}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isTyping && sendMessage(input)
                  }
                  placeholder={
                    isTyping
                      ? "AI sedang menjawab..."
                      : "Mau tanya apa?"
                  }
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 disabled:opacity-60"
                />
                <button
                  disabled={isTyping}
                  onClick={() => sendMessage(input)}
                  className="bg-indigo-600 text-white px-4 rounded-lg disabled:opacity-60"
                >
                  Kirim
                </button>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  Powered by Nusantara AI
                </span>
                <button
                  onClick={resetChat}
                  disabled={isTyping}
                  className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                >
                  Reset Chat
                </button>
              </div>

         {/* QUICK REPLIES */}
<div className="relative mt-2">
  <div className="flex gap-2 overflow-x-auto pb-1 pr-6 scrollbar-hide">
    {quickReplies.map((q, idx) => (
      <button
        key={idx}
        disabled={isTyping}
        onClick={() => sendMessage(q.question)}
        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-xs whitespace-nowrap disabled:opacity-50"
      >
        {q.question}
      </button>
    ))}
  </div>

  {/* FADE INDICATOR KANAN */}
  <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />
</div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
