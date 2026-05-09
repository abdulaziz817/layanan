import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  memo,
  useCallback,
} from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { FiX, FiMinus, FiRefreshCw, FiSend, FiAlertTriangle } from "react-icons/fi";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";

/**
 * FloatingAI.jsx (Simple + clean) - FIXED
 * - Animasi popup mulus (HP lemah)
 * - UI input lebih compact + cursor pas
 * - Anti response HTML/404: tidak tampilkan HTML mentah
 * - Persist localStorage
 * - Quick replies
 * - Online/offline + retry
 * - Enter kirim, Shift+Enter newline
 */

// ✅ GANTI INI sesuai backend kamu:
const CHAT_ENDPOINT = "/.netlify/functions/chat"; // Netlify Functions

const STORAGE_KEY = "nusantara_ai_chat_simple_v1";
const VERSION_LABEL = "v2.3";


/** Variants ringan (GPU friendly) */
const popupVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.1, ease: "easeOut" },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.14, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.1, ease: "easeIn" },
  },
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

/** ✅ Deteksi HTML supaya gak kebaca jadi pesan error panjang */
function looksLikeHTML(str) {
  const s = (str || "").trim().toLowerCase();
  if (!s) return false;
  return s.startsWith("<!doctype html") || s.startsWith("<html") || s.includes("<head") || s.includes("<body");
}

/** ✅ Ambil pesan error yang rapi */
function friendlyErrorMessage(res, txt) {
  // Kalau HTML/404 page
  if (looksLikeHTML(txt)) {
    if (res?.status === 404) {
      return "Endpoint chat tidak ditemukan (404). Cek CHAT_ENDPOINT kamu (Netlify vs Next.js).";
    }
    return "Server mengembalikan halaman HTML (bukan JSON). Cek endpoint chat kamu.";
  }

  // Kalau JSON dengan content/message
  const data = safeParse(txt, null);
  if (data && typeof data === "object") {
    return (
      data?.content ||
      data?.message ||
      data?.error ||
      `Terjadi kesalahan (HTTP ${res?.status || "?"}).`
    );
  }

  // Fallback text biasa (dipotong biar gak panjang)
  const trimmed = (txt || "").trim();
  if (!trimmed) return `Terjadi kesalahan (HTTP ${res?.status || "?"}).`;
  return trimmed.length > 160 ? `${trimmed.slice(0, 160)}…` : trimmed;
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
  answer: "💳 Metode pembayaran yang tersedia:\n• QRIS\n• Transfer Bank (BCA)\n• GoPay\n• PayPal\n• Crypto (USDT / BTC / ETH / BNB)\n\nPembayaran crypto hanya dapat dilakukan melalui wallet atau exchange crypto.",
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

useEffect(() => {
  const t = setTimeout(() => setShowIntro(false), 3200);
  return () => clearTimeout(t);
}, []);

  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState("");

  const [unread, setUnread] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const [sendError, setSendError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // ✅ shadow berat setelah animasi selesai
  const [settled, setSettled] = useState(false);

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

  useEffect(() => {
  const openFromNavbar = () => {
    setOpen(true);
    setMinimized(false);
    setShowIntro(false);
  };

  window.addEventListener("open-nusantara-ai", openFromNavbar);

  return () => {
    window.removeEventListener("open-nusantara-ai", openFromNavbar);
  };
}, []);

  /* ===== textarea auto-resize (compact + cursor pas + anti scrollbar kecil) ===== */
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;

    const raf = requestAnimationFrame(() => {
      ta.style.height = "auto";

      const MIN = 40;
      const MAX = 96;

      const next = Math.max(MIN, Math.min(ta.scrollHeight, MAX));
      ta.style.height = `${next}px`;
      ta.style.overflowY = ta.scrollHeight > MAX ? "auto" : "hidden";
    });

    return () => cancelAnimationFrame(raf);
  }, [input]);

  useEffect(() => {
    if (!open || minimized) return;
    const ta = taRef.current;
    if (!ta) return;

    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        ta.style.height = "auto";

        const MIN = 40;
        const MAX = 96;

        const next = Math.max(MIN, Math.min(ta.scrollHeight, MAX));
        ta.style.height = `${next}px`;
        ta.style.overflowY = ta.scrollHeight > MAX ? "auto" : "hidden";
      });
    }, 180);

    return () => clearTimeout(t);
  }, [open, minimized]);

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
     endRef.current?.scrollIntoView({ behavior: "auto" });
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  }, [messages, isTyping, open, minimized]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 220;
    setShowScrollToBottom(!nearBottom);
  }, []);

  const resetChat = useCallback(() => {
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
  }, [isTyping]);

  const sendMessage = useCallback(
    async (text, opts = {}) => {
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

      // quick reply local (tanpa server)
      const matched = findQuickReply(raw);
      if (matched) {
        setTimeout(() => {
          setMessages((p) => [
            ...p,
            { id: uid(), role: "assistant", content: matched.answer, ts: Date.now() },
          ]);
          setIsTyping(false);
        }, 350);
        return;
      }

      if (!isOnline) {
        setIsTyping(false);
        setSendError("Anda sedang offline. Pesan belum terkirim.");
        return;
      }

      try {
        const res = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: raw.trim() }),
        });

        const txt = await res.text();

        if (!res.ok) {
          throw new Error(friendlyErrorMessage(res, txt));
        }

        // kalau server balikin HTML padahal status 200, tetap anggap error
        if (looksLikeHTML(txt)) {
          throw new Error("Server mengembalikan HTML (bukan JSON). Cek endpoint chat kamu.");
        }

        const data = safeParse(txt, {});
        const answer = (data?.content || data?.message || "").toString().trim();

        if (!answer) {
          throw new Error("Server tidak mengirim field 'content'. Cek response backend kamu.");
        }

        setMessages((p) => [
          ...p,
          { id: uid(), role: "assistant", content: answer, ts: Date.now() },
        ]);
      } catch (err) {
        const msg =
          (err?.message || "").toString() || "⚠️ Terjadi kesalahan saat menghubungi server.";
        setSendError(msg);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, isOnline]
  );

  const retryLast = useCallback(() => {
    if (isTyping) return;
    if (!lastUserMessage) return;
    sendMessage(lastUserMessage, { retried: true });
  }, [isTyping, lastUserMessage, sendMessage]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isTyping) sendMessage(input);
      }
    },
    [isTyping, sendMessage, input]
  );

  const openChat = useCallback(() => {
    setSettled(false);
    setOpen(true);
    setMinimized(false);
  }, []);

  const closeChat = useCallback(() => {
    if (isTyping) return;
    setSettled(false);
    setOpen(false);
    setMinimized(false);
  }, [isTyping]);

  const minimizeChat = useCallback(() => {
    if (isTyping) return;
    setSettled(false);
    setMinimized(true);
  }, [isTyping]);

  const scrollToBottom = useCallback(() => {
   endRef.current?.scrollIntoView({ behavior: "auto" });
    setShowScrollToBottom(false);
  }, []);

  const chips = useMemo(() => QUICK_REPLIES, []);

  return (
  <LazyMotion features={domAnimation}>
    <>
      {/* INTRO */}
      <AnimatePresence initial={false}>
        {showIntro && !open && (
          <m.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-4 z-50"
          >
            <button
              onClick={openChat}
              className="group w-[260px] rounded-[24px] border border-white/20 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 px-4 py-3 text-left text-white shadow-[0_20px_60px_rgba(79,70,229,0.35)] backdrop-blur-xl transition hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-wide">
                    Chat Nusantara AI
                  </div>
                  <div className="text-xs text-white/80">
                    AI Assistant • {VERSION_LABEL}
                  </div>
                </div>
              </div>
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* FLOAT BUTTON */}
      {!open && (
        <m.button
          onClick={openChat}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", duration: 0.16, ease: "easeOut" }}
         className="fixed bottom-6 right-6 md:bottom-6 md:right-6 max-md:bottom-28 max-md:right-5 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition active:scale-95"
          aria-label="Buka chat"
        >
          <div className="relative">
            <HiOutlineChatBubbleLeftRight className="text-[28px]" />
            {unread > 0 && (
              <span className="absolute -right-3 -top-3 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white ring-2 ring-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
        </m.button>
      )}

      {/* MINIMIZED */}
      <AnimatePresence initial={false}>
        {open && minimized && (
          <m.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-6 right-6 md:bottom-6 md:right-6 max-md:bottom-28 max-md:right-5 z-[9999]"
            onAnimationComplete={() => setSettled(true)}
          >
            <button
              onClick={() => {
                setSettled(false);
                setMinimized(false);
              }}
          className={`flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-slate-800 transition ${
  settled ? "shadow-md" : "shadow-sm"
}`}
              aria-label="Buka kembali chat"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                🤖
              </span>
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold">Nusantara AI</div>
                <div className="text-[11px] text-white/80">Klik untuk lanjut</div>
              </div>
              {unread > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-medium text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </m.div>
        )}
      </AnimatePresence>

      {/* CHAT BOX */}
      <AnimatePresence initial={false}>
        {open && !minimized && (
          <m.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onAnimationComplete={() => setSettled(true)}
        className={`fixed bottom-6 right-6 max-md:bottom-28 max-md:right-4 z-[9999] flex h-[72vh] max-h-[560px] w-[92vw] max-w-[26rem] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white ${
  settled ? "shadow-lg" : "shadow-md"
}`}
            role="dialog"
            aria-label="Chat Nusantara AI"
          >
            {/* HEADER */}
          <div className="bg-indigo-600 px-4 py-4 text-white">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    🤖
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold tracking-wide">
                        Nusantara AI
                      </p>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/90 ring-1 ring-white/15">
                        {VERSION_LABEL}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-2 text-[11px] text-white/85">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/10">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOnline ? "bg-emerald-300" : "bg-amber-300"
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
                    className="rounded-xl p-2 transition hover:bg-white/15 disabled:opacity-50"
                    aria-label="Reset"
                    title="Reset"
                  >
                    <FiRefreshCw size={16} />
                  </button>
                  <button
                    onClick={minimizeChat}
                    disabled={isTyping}
                    className="rounded-xl p-2 transition hover:bg-white/15 disabled:opacity-50"
                    aria-label="Minimize"
                    title="Minimize"
                  >
                    <FiMinus size={16} />
                  </button>
                  <button
                    onClick={closeChat}
                    disabled={isTyping}
                    className="rounded-xl p-2 transition hover:bg-white/15 disabled:opacity-50"
                    aria-label="Tutup"
                    title="Tutup"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* CHAT AREA */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
             className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4"
            >
              {messages.map((mm) => (
                <MessageBubble key={mm.id} msg={mm} />
              ))}

              {isTyping && (
                <div className="mr-auto max-w-[82%]">
                  <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
                    <TypingDots />
                    <span className="text-xs text-slate-500">mengetik…</span>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* SCROLL TO BOTTOM */}
            {showScrollToBottom && (
              <div className="absolute bottom-[146px] right-4 z-50">
                <button
                  onClick={scrollToBottom}
                  className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
                >
                  Ke bawah ↓
                </button>
              </div>
            )}

            {/* ERROR PANEL */}
            {sendError && (
              <div className="border-t border-red-100 bg-white px-3 pb-2 pt-2">
                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-700">
                  <FiAlertTriangle className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold">Gagal mengirim</div>
                    <div className="opacity-90">{sendError}</div>
                    <button
                      onClick={retryLast}
                      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-3 py-2 text-xs text-white transition hover:brightness-110"
                      disabled={isTyping}
                    >
                      <FiRefreshCw />
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QUICK REPLIES */}
            <div className="border-t border-slate-100 bg-white/90 px-3 pb-1 pt-2 backdrop-blur">
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto pb-2 pr-6 scrollbar-hide">
                  {chips.map((q) => (
                    <button
                      key={q.question}
                      disabled={isTyping}
                      onClick={() => sendMessage(q.question)}
                      className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
                <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent" />
              </div>
            </div>

            {/* INPUT */}
            <div className="border-t border-slate-100 bg-white/95 p-3 backdrop-blur">
              <div className="flex items-end gap-2">
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-2 py-2 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100">
                  <textarea
                    ref={taRef}
                    value={input}
                    disabled={isTyping}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={
                      isTyping
                        ? "AI sedang menjawab…"
                        : "Tulis pertanyaan tentang layanan…"
                    }
                    rows={1}
                    className="min-h-[24px] max-h-[96px] w-full resize-none bg-transparent px-2 text-[13px] leading-5 text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  disabled={isTyping || !input.trim()}
                  onClick={() => sendMessage(input)}
                  className="inline-flex h-[44px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 px-4 text-[13px] font-medium text-white shadow-[0_10px_24px_rgba(79,70,229,0.30)] transition hover:brightness-110 disabled:opacity-50"
                >
                  <FiSend />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Powered by Nusantara AI
                </span>
                <button
                  onClick={resetChat}
                  disabled={isTyping}
                  className="text-[11px] font-medium text-indigo-600 transition hover:underline disabled:opacity-50"
                >
                  Reset Chat
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  </LazyMotion>
);
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center" aria-hidden="true">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 opacity-70" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 opacity-85" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
    </div>
  );
}
const MessageBubble = memo(function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isError = !!msg?.meta?.isError;
  const content = (msg.content || "").toString();

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className="max-w-[84%]">
        {!isUser && (
          <div className="mb-1 flex items-center gap-2 pl-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] text-white shadow-sm">
              ✦
            </div>
            <span className="text-[11px] font-medium text-slate-500">Nusantara AI</span>
          </div>
        )}

        <div
          className={
            isUser
              ?"rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-white shadow-sm"
              : isError
              ? "rounded-2xl rounded-bl-md border border-red-200 bg-red-50 px-4 py-2.5 text-red-800 shadow-sm"
              : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2.5 text-slate-800"
          }
        >
          {content.split("\n").map((line, idx) => (
            <p key={idx} className="text-[13px] leading-6 whitespace-pre-wrap">
              {line || <span className="block h-2" />}
            </p>
          ))}
        </div>

        <div
          className={
            isUser
              ? "mt-1 pr-1 text-right text-[10px] text-slate-400"
              : "mt-1 pl-1 text-left text-[10px] text-slate-400"
          }
        >
          {formatTime(msg.ts || Date.now())}
        </div>
      </div>
    </div>
  );
});
