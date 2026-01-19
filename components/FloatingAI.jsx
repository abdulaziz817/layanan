import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiMinus, FiRefreshCw, FiSend, FiAlertTriangle } from "react-icons/fi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

/**
 * FloatingAI.jsx (Simple + clean)
 * - Warna: indigo-600 + putih (tanpa gradient)
 * - Unread badge
 * - Minimize pill
 * - Persist chat ke localStorage
 * - Quick replies chips (tidak nabrak input)
 * - Smart autoscroll + tombol "Ke bawah"
 * - Textarea auto-resize
 * - Online/offline + retry
 * - Enter = kirim, Shift+Enter = baris baru
 *
 * Backend:
 * POST /.netlify/functions/chat
 * body: { message: string }
 * response: { content?: string }
 */

const STORAGE_KEY = "nusantara_ai_chat_simple_v1";
const VERSION_LABEL = "v2.3";

const popupVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: 18, scale: 0.985, transition: { duration: 0.16 } },
};

function uid() {
  try {
    // @ts-ignore
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts) {
  try {
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(
      new Date(ts)
    );
  } catch {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
}

function safeParse(s, fallback) {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

const DEFAULT_MESSAGES = [
  {
    id: uid(),
    role: "assistant",
    content:
      "Halo 👋\nSaya Nusantara AI.\nSiap membantu Anda seputar layanan, pemesanan, dan pembayaran.",
    ts: Date.now(),
  },
];

const QUICK_REPLIES = [
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
    answer: "💳 Metode pembayaran:\n• QRIS\n• Transfer Bank (BCA)\n• GoPay\n• PayPal",
  },
  {
    question: "Bisa konsultasi dulu?",
    answer:
      "Bisa. Kirim ringkas kebutuhan Anda:\n1) jenis layanan\n2) detail/tujuan\n3) budget\n4) deadline\nNanti saya bantu susun opsi terbaik.",
  },
];

function findQuickReply(text) {
  const t = (text || "").toLowerCase();
  return QUICK_REPLIES.find((q) => t.includes(q.question.toLowerCase())) || null;
}

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState("");

  const [unread, setUnread] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const [sendError, setSendError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollRef = useRef(null);
  const endRef = useRef(null);
  const taRef = useRef(null);

  /* ===== load/save ===== */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = safeParse(localStorage.getItem(STORAGE_KEY) || "", null);
    if (saved?.messages?.length) setMessages(saved.messages);
    if (typeof saved?.minimized === "boolean") setMinimized(saved.minimized);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, minimized, savedAt: Date.now() }));
  }, [messages, minimized]);

  /* ===== intro ===== */
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 3200);
    return () => clearTimeout(t);
  }, []);

  /* ===== online/offline ===== */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  /* ===== textarea auto-resize ===== */
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    const next = Math.max(44, Math.min(ta.scrollHeight, 120));
    ta.style.height = `${next}px`;
  }, [input, open, minimized]);

  /* ===== unread badge ===== */
  useEffect(() => {
    const last = messages[messages.length - 1];
    if ((!open || minimized) && last?.role === "assistant") setUnread((u) => u + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    if (open && !minimized) setUnread(0);
  }, [open, minimized]);

  /* ===== smart autoscroll ===== */
  useEffect(() => {
    if (!open || minimized) return;
    const el = scrollRef.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 220;
    if (nearBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  }, [messages, isTyping, open, minimized]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 220;
    setShowScrollToBottom(!nearBottom);
  };

  const resetChat = () => {
    if (isTyping) return;
    setSendError(null);
    setLastUserMessage(null);
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: "Halo 👋\nSaya Nusantara AI.\nAda yang bisa saya bantu?",
        ts: Date.now(),
      },
    ]);
  };

  const sendMessage = async (text, opts = {}) => {
    const raw = (text ?? "").toString();
    if (!raw.trim() || isTyping) return;

    setSendError(null);

    const userMsg = {
      id: uid(),
      role: "user",
      content: raw,
      ts: Date.now(),
      meta: { retried: !!opts.retried },
    };

    setMessages((p) => [...p, userMsg]);
    setLastUserMessage(raw);
    setInput("");
    setIsTyping(true);

    // quick reply
    const matched = findQuickReply(raw);
    if (matched) {
      setTimeout(() => {
        setMessages((p) => [
          ...p,
          { id: uid(), role: "assistant", content: matched.answer, ts: Date.now() },
        ]);
        setIsTyping(false);
      }, 550);
      return;
    }

    if (!isOnline) {
      setIsTyping(false);
      setSendError("Anda sedang offline. Pesan belum terkirim.");
      return;
    }

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: raw.trim() }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content: data?.content || "Maaf, saya belum punya jawaban untuk itu.",
          ts: Date.now(),
        },
      ]);
    } catch {
      setSendError("⚠️ Terjadi kesalahan saat menghubungi server. Coba kirim ulang.");
      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content: "⚠️ Maaf, koneksi bermasalah. Tekan tombol *Retry* untuk mengirim ulang pesan terakhir.",
          ts: Date.now(),
          meta: { isError: true },
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const retryLast = () => {
    if (isTyping) return;
    if (!lastUserMessage) return;
    sendMessage(lastUserMessage, { retried: true });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) sendMessage(input);
    }
  };

  const openChat = () => {
    setOpen(true);
    setMinimized(false);
  };

  const closeChat = () => {
    if (isTyping) return;
    setOpen(false);
    setMinimized(false);
  };

  const minimizeChat = () => {
    if (isTyping) return;
    setMinimized(true);
  };

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollToBottom(false);
  };

  const chips = useMemo(() => QUICK_REPLIES, []);

  return (
    <>
      {/* INTRO */}
      <AnimatePresence>
        {showIntro && !open && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-4 z-50"
          >
            <button
              onClick={openChat}
              className="bg-indigo-600 text-white px-4 py-3 rounded-2xl shadow-lg text-left w-[240px] hover:brightness-110 transition"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  🤖
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">Chat Nusantara AI</div>
                  <div className="text-xs opacity-90">AI Assistant • {VERSION_LABEL}</div>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOAT BUTTON */}
      {!open && (
        <motion.button
          onClick={openChat}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white border-4 border-indigo-600 shadow-xl flex items-center justify-center"
          aria-label="Buka chat"
        >
          <div className="relative">
            <HiOutlineChatBubbleLeftRight className="text-black text-2xl" />
            {unread > 0 && (
              <span className="absolute -top-3 -right-3 h-6 min-w-[24px] px-1 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
        </motion.button>
      )}

      {/* MINIMIZED */}
      <AnimatePresence>
        {open && minimized && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => setMinimized(false)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:brightness-110 transition"
              aria-label="Buka kembali chat"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                🤖
              </span>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold">Nusantara AI</div>
                <div className="text-[11px] opacity-90">Klik untuk lanjut</div>
              </div>
              {unread > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHAT BOX */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 z-50 w-[22rem] md:w-[26rem] h-[520px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            role="dialog"
            aria-label="Chat Nusantara AI"
          >
            {/* HEADER */}
            <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">Nusantara AI</p>
                    <span className="text-[11px] opacity-90">{VERSION_LABEL}</span>
                  </div>
                  <p className="text-[11px] opacity-90 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? "bg-green-300" : "bg-yellow-300"
                        }`}
                      />
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  disabled={isTyping}
                  className="hover:bg-white/15 p-2 rounded-xl transition disabled:opacity-50"
                  aria-label="Reset"
                  title="Reset"
                >
                  <FiRefreshCw size={16} />
                </button>
                <button
                  onClick={minimizeChat}
                  disabled={isTyping}
                  className="hover:bg-white/15 p-2 rounded-xl transition disabled:opacity-50"
                  aria-label="Minimize"
                  title="Minimize"
                >
                  <FiMinus size={16} />
                </button>
                <button
                  onClick={closeChat}
                  disabled={isTyping}
                  className="hover:bg-white/15 p-2 rounded-xl transition disabled:opacity-50"
                  aria-label="Tutup"
                  title="Tutup"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* CHAT AREA */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="flex-1 overflow-y-auto bg-gray-50 p-3 space-y-2"
            >
              {messages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))}

              {isTyping && (
                <div className="mr-auto max-w-[80%]">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border shadow-sm">
                    <TypingDots />
                    <span className="text-xs text-gray-500">mengetik…</span>
                  </div>
                </div>
              )}

              {sendError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
                  <FiAlertTriangle className="mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold">Gagal mengirim</div>
                    <div className="opacity-90">{sendError}</div>
                    <button
                      onClick={retryLast}
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-3 py-2 text-xs hover:brightness-110 transition"
                      disabled={isTyping}
                    >
                      <FiRefreshCw /> Retry
                    </button>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>


            {/* QUICK REPLIES (pisah, tidak nabrak input) */}
            <div className="px-3 pt-2 pb-1 bg-white border-t">
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 pr-6 scrollbar-hide">
                  {chips.map((q) => (
                    <button
                      key={q.question}
                      disabled={isTyping}
                      onClick={() => sendMessage(q.question)}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-xs whitespace-nowrap disabled:opacity-50"
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
              </div>
            </div>

            {/* INPUT (kirim sejajar) */}
            <div className="p-3 bg-white">
              <div className="flex items-end gap-2">
                <textarea
                  ref={taRef}
                  value={input}
                  disabled={isTyping}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={
                    isTyping
                      ? "AI sedang menjawab…"
                      : "Tulis pertanyaan Seputar Layanan Nusantara"
                  }
                  className="flex-1 min-h-[44px] max-h-[120px] resize-none border rounded-2xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none disabled:opacity-60"
                  rows={1}
                />
                <button
                  disabled={isTyping || !input.trim()}
                  onClick={() => sendMessage(input)}
                  className="h-[44px] px-4 rounded-2xl bg-indigo-600 text-white shadow-sm disabled:opacity-50 hover:brightness-110 transition inline-flex items-center gap-2"
                >
                  <FiSend />
                  Kirim
                </button>
              </div>

              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">Powered by Nusantara AI</span>
                <button
                  onClick={resetChat}
                  disabled={isTyping}
                  className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                >
                  Reset Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center" aria-hidden="true">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isError = !!msg?.meta?.isError;
  const content = (msg.content || "").toString();

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className="max-w-[82%]">
        <div
          className={
            isUser
              ? "px-4 py-2 rounded-2xl rounded-br-md bg-indigo-600 text-white shadow-sm"
              : isError
              ? "px-4 py-2 rounded-2xl rounded-bl-md bg-red-50 text-red-800 border border-red-200"
              : "px-4 py-2 rounded-2xl rounded-bl-md bg-white text-gray-800 border shadow-sm"
          }
        >
          {content.split("\n").map((line, idx) => (
            <p key={idx} className="text-sm leading-relaxed whitespace-pre-wrap">
              {line || <span className="block h-2" />}
            </p>
          ))}
        </div>
        <div
          className={
            isUser
              ? "mt-1 text-[10px] text-gray-500 text-right pr-1"
              : "mt-1 text-[10px] text-gray-500 text-left pl-1"
          }
        >
          {formatTime(msg.ts || Date.now())}
        </div>
      </div>
    </div>
  );
}
