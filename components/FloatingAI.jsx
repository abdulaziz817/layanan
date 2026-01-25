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
    y: 14,
    scale: 0.995,
    transition: { type: "tween", duration: 0.12, ease: "easeOut" },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "tween", duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 14,
    scale: 0.995,
    transition: { type: "tween", duration: 0.12, ease: "easeIn" },
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
    answer: "💳 Metode pembayaran:\n• QRIS\n• Transfer Bank (BCA)\n• GoPay\n• PayPal",
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
      endRef.current?.scrollIntoView({ behavior: "smooth" });
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
    endRef.current?.scrollIntoView({ behavior: "smooth" });
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
              className="fixed bottom-24 right-4 z-50 transform-gpu will-change-transform will-change-opacity"
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
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white border-4 border-indigo-600 shadow-xl flex items-center justify-center transform-gpu will-change-transform will-change-opacity"
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
              className="fixed bottom-6 right-6 z-50 transform-gpu will-change-transform will-change-opacity"
              onAnimationComplete={() => setSettled(true)}
            >
              <button
                onClick={() => {
                  setSettled(false);
                  setMinimized(false);
                }}
                className={`flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-full hover:brightness-110 transition ${
                  settled ? "shadow-lg" : "shadow-md"
                }`}
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
              className={`fixed bottom-6 right-6 z-50 bg-white rounded-3xl overflow-hidden flex flex-col
                w-[92vw] max-w-[26rem] h-[70vh] max-h-[520px]
                transform-gpu will-change-transform will-change-opacity
                ${settled ? "shadow-2xl" : "shadow-lg"}
              `}
              role="dialog"
              aria-label="Chat Nusantara AI"
              onAnimationComplete={() => setSettled(true)}
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
                {messages.map((mm) => (
                  <MessageBubble key={mm.id} msg={mm} />
                ))}

                {isTyping && (
                  <div className="mr-auto max-w-[80%]">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border shadow-sm">
                      <TypingDots />
                      <span className="text-xs text-gray-500">mengetik…</span>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* SCROLL TO BOTTOM */}
              {showScrollToBottom && (
                <div className="absolute bottom-[142px] right-4 z-50">
                  <button
                    onClick={scrollToBottom}
                    className="rounded-full bg-white border shadow-md px-3 py-2 text-xs hover:bg-gray-50 transition"
                  >
                    Ke bawah ↓
                  </button>
                </div>
              )}

              {/* ERROR PANEL */}
              {sendError && (
                <div className="px-3 pb-2 bg-white border-t">
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
                </div>
              )}

              {/* QUICK REPLIES */}
              <div className="px-3 pt-2 pb-1 bg-white border-t">
                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto pb-2 pr-6 scrollbar-hide">
                    {chips.map((q) => (
                      <button
                        key={q.question}
                        disabled={isTyping}
                        onClick={() => sendMessage(q.question)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap disabled:opacity-50"
                      >
                        {q.question}
                      </button>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
                </div>
              </div>

              {/* INPUT (compact + cursor pas) */}
              <div className="p-2 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={taRef}
                    value={input}
                    disabled={isTyping}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={isTyping ? "AI sedang menjawab…" : "Tulis pertanyaan tentang layanan…"}
                    rows={1}
                    className="
                      flex-1
                      min-h-[40px] max-h-[96px]
                      resize-none
                      border rounded-2xl
                      px-3 pt-2.5 pb-2
                      text-[13px] leading-5
                      outline-none
                      focus:ring-2 focus:ring-indigo-600
                      disabled:opacity-60
                      overflow-hidden
                    "
                  />
                  <button
                    disabled={isTyping || !input.trim()}
                    onClick={() => sendMessage(input)}
                    className="h-[40px] px-3 rounded-2xl bg-indigo-600 text-white shadow-sm disabled:opacity-50 hover:brightness-110 transition inline-flex items-center gap-2 text-[13px]"
                  >
                    <FiSend />
                    Kirim
                  </button>
                </div>

                <div className="mt-1 flex justify-between items-center">
                  <span className="text-[11px] text-gray-400">Powered by Nusantara AI</span>
                  <button
                    onClick={resetChat}
                    disabled={isTyping}
                    className="text-[11px] text-indigo-600 hover:underline disabled:opacity-50"
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
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
    </div>
  );
}

const MessageBubble = memo(function MessageBubble({ msg }) {
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
});
