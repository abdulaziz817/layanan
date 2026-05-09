"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  FiSend,
  FiUpload,
  FiMic,
  FiCode,
  FiFileText,
  FiCamera,
  FiMonitor,
  FiRefreshCw,
  FiMessageCircle,
  FiPlus,
  FiX,
} from "react-icons/fi";

const MODES = [
  { id: "chat", label: "Chat", icon: FiMessageCircle, prompt: "" },
  { id: "vision", label: "Upload", icon: FiUpload, prompt: "Jelaskan isi file/gambar ini secara jelas." },
  { id: "coding", label: "Coding", icon: FiCode, prompt: "Bantu buat atau perbaiki kode ini:" },
  { id: "rewrite", label: "Tulis/Edit", icon: FiFileText, prompt: "Rewrite teks ini agar lebih profesional:" },
  { id: "camera", label: "Camera", icon: FiCamera, prompt: "Analisis gambar dari camera/screen ini:" },
];

function uid() {
  return crypto?.randomUUID?.() || `id_${Date.now()}`;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AIPage() {
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([
    {
      id: uid(),
      role: "assistant",
      content: "Halo, saya Nusantara AI. Mau bantu apa hari ini?",
    },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [listening, setListening] = useState(false);

  const videoRef = useRef(null);
  const fileRef = useRef(null);
  const activeMode = useMemo(() => MODES.find((m) => m.id === mode), [mode]);

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setMode("vision");
    setInput("Jelaskan isi file/gambar ini secara jelas.");
    setMenuOpen(false);

    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview("");
  }

  async function sendChat(extraFile = null) {
    const text = input.trim();
    const selectedFile = extraFile || file;
    if (!text && !selectedFile) return;

    setLoading(true);
    setInput("");

    setMessages((p) => [
      ...p,
      {
        id: uid(),
        role: "user",
        content: text || `Upload file: ${selectedFile?.name}`,
        fileName: selectedFile?.name,
        preview,
      },
    ]);

    try {
      const payload = {
        message: text || "Jelaskan isi file ini.",
        mode,
        history: messages.map((m) => ({ role: m.role, content: m.content })).slice(-10),
      };

      if (selectedFile) {
        payload.fileBase64 = await fileToBase64(selectedFile);
        payload.mimeType = selectedFile.type || "application/octet-stream";
        payload.fileName = selectedFile.name || "upload";
      }

      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.content || data?.error || "Gagal menghubungi AI");

      setMessages((p) => [
        ...p,
        {
          id: uid(),
          role: "assistant",
          content: data.content || "Baik, ada yang bisa saya bantu?",
        },
      ]);

      setFile(null);
      setPreview("");
    } catch (err) {
      setMessages((p) => [
        ...p,
        { id: uid(), role: "assistant", content: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function chooseMode(item) {
    setMode(item.id);
    setInput(item.prompt || "");
    setMenuOpen(false);
  }

  function resetChat() {
    setMessages([{ id: uid(), role: "assistant", content: "Chat direset. Mau mulai apa?" }]);
    setFile(null);
    setPreview("");
    setInput("");
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input belum support di browser ini.");

    const rec = new SpeechRecognition();
    rec.lang = "id-ID";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript || "";
      setInput((p) => `${p ? p + " " : ""}${text}`);
    };
    rec.start();
  }

  async function startCamera() {
    setMode("camera");
    setMenuOpen(false);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    if (videoRef.current) videoRef.current.srcObject = stream;
  }

  async function startScreen() {
    setMode("camera");
    setMenuOpen(false);
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    if (videoRef.current) videoRef.current.srcObject = stream;
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    const f = new File([blob], "capture.png", { type: "image/png" });

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMode("vision");
    setInput("Analisis gambar/screenshot ini secara jelas.");
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex h-[calc(100vh-72px)] max-w-5xl flex-col border-x border-slate-100 bg-white">
        {/* HEADER */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur">
          <div>
            <h1 className="text-lg font-bold">Nusantara AI</h1>
            <p className="text-xs text-slate-500">{activeMode?.label} Mode</p>
          </div>

          <button
            onClick={resetChat}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50"
          >
            Reset
          </button>
        </header>

        {/* CHAT AREA */}
        <section className="flex-1 overflow-y-auto px-4 py-5">
          {messages.map((m) => (
            <div key={m.id} className={`mb-5 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-6 ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-800 shadow-sm"
              }`}>
                {m.fileName && (
                  <div className="mb-2 rounded-xl bg-black/10 px-3 py-2 text-xs">
                    File: {m.fileName}
                  </div>
                )}

                {m.preview && (
                  <img src={m.preview} alt="preview" className="mb-3 max-h-72 rounded-2xl object-contain" />
                )}

                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}

          {mode === "camera" && (
            <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-3">
              <video ref={videoRef} autoPlay playsInline muted className="max-h-80 w-full rounded-2xl bg-black object-contain" />
              <button onClick={captureFrame} className="mt-3 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
                Capture lalu analisis
              </button>
            </div>
          )}

          {loading && <div className="text-sm text-slate-400">Nusantara AI sedang mengetik...</div>}
        </section>

        {/* FILE PREVIEW */}
        {(preview || file) && (
          <div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            {preview && <img src={preview} alt="preview" className="h-12 w-12 rounded-xl object-cover" />}
            <div className="min-w-0 flex-1 text-xs">
              <div className="truncate font-semibold">{file?.name}</div>
              <div className="text-slate-500">Siap dikirim</div>
            </div>
            <button onClick={() => { setFile(null); setPreview(""); }} className="rounded-full p-2 hover:bg-white">
              <FiX />
            </button>
          </div>
        )}

        {/* BOTTOM MENU */}
        {menuOpen && (
          <div className="mx-4 mb-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {MODES.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => chooseMode(item)}
                    className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm hover:bg-slate-50"
                  >
                    <Icon className="text-lg text-slate-600" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm hover:bg-slate-50">
                <FiUpload className="text-lg text-slate-600" /> File
              </button>

              <button onClick={startCamera} className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm hover:bg-slate-50">
                <FiCamera className="text-lg text-slate-600" /> Kamera
              </button>

              <button onClick={startScreen} className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm hover:bg-slate-50">
                <FiMonitor className="text-lg text-slate-600" /> Screen
              </button>
            </div>

            <p className="mt-2 px-2 text-xs text-slate-400">
              Buat gambar AI dimatikan dulu karena quota image Gemini gratis limit 0.
            </p>
          </div>
        )}

        {/* INPUT */}
        <footer className="sticky bottom-0 border-t border-slate-100 bg-white px-4 py-3">
          <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.md,.csv" onChange={handleFile} className="hidden" />

          <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2">
            <button onClick={() => setMenuOpen((v) => !v)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
              {menuOpen ? <FiX /> : <FiPlus />}
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChat();
                }
              }}
              placeholder="Tanya Nusantara AI..."
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
            />

            <button onClick={startVoice} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm">
              <FiMic className={listening ? "text-emerald-500" : ""} />
            </button>

            <button
              onClick={() => sendChat()}
              disabled={loading || (!input.trim() && !file)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-40"
            >
              <FiSend />
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}