import { useEffect, useState } from "react";

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Halo 👋 Aku AI Nusantara. Tanya apa aja ya!" }
  ]);
  const [input, setInput] = useState("");

  // popup awal → jadi icon
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();

    setMessages(prev => [
      ...prev,
      { role: "assistant", content: data.reply }
    ]);
  };

  return (
    <>
      {/* POPUP INTRO */}
      {showIntro && !open && (
        <div className="fixed bottom-24 right-4 z-50 animate-slideIn">
          <div
            onClick={() => setOpen(true)}
            className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg cursor-pointer"
          >
            💬 Tanya AI
            <div className="text-xs opacity-90">Layanan Nusantara</div>
          </div>
        </div>
      )}

      {/* ICON */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl"
        >
          🤖
        </button>
      )}

      {/* CHAT BOX */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-[420px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-indigo-600 text-white px-4 py-3 flex justify-between">
            <span>AI Nusantara</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>
<div className="flex-1 p-3 text-sm overflow-y-auto">
  {messages.map((msg, i) => (
    <div
      key={i}
      className={`mb-2 p-2 rounded-lg ${
        msg.role === "user"
          ? "bg-indigo-100 text-right"
          : "bg-gray-100"
      }`}
    >
      {msg.content}
    </div>
  ))}
</div>


          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tanya apa aja..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white px-4 rounded-lg"
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </>
  );
}
