import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { jsPDF } from "jspdf";
function buildNarrationText(materi) {
  if (!materi) return "";

  return `
${materi.judul || ""}
${materi.deskripsi || ""}

${materi.intro || ""}

${materi.highlight || ""}

${materi.section1_title || ""}
${materi.section1_content || ""}

${materi.section2_title || ""}
${materi.section2_content || ""}

${materi.section3_title || ""}
${materi.section3_content || ""}

${materi.summary1 || ""}
${materi.summary2 || ""}
${materi.summary3 || ""}
${materi.summary4 || ""}
  `.trim();
}

function dataUrlToParts(dataUrl) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    imageBase64: match[2],
  };
}

function estimateBase64SizeInBytes(base64String) {
  const padding = (base64String.match(/=*$/)?.[0]?.length || 0);
  return Math.floor((base64String.length * 3) / 4) - padding;
}

async function compressImageFile(file, maxSize = 960, quality = 0.72) {
  const img = await createImageBitmap(file);

  let { width, height } = img;

  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height >= width && height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context tidak tersedia");
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  return new Promise((resolve, reject) => {
    if (!blob) {
      reject(new Error("Gagal mengompres gambar"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result?.toString() || "");
    };
    reader.onerror = () => reject(new Error("Gagal membaca hasil kompres"));
    reader.readAsDataURL(blob);
  });
}





function formatTanggalIndonesia(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function sanitizeFileName(text) {
  return String(text || "materi-layanan-nusantara")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function generateProfessionalPdf(materi) {
  if (!materi) {
    alert("Materi belum tersedia.");
    return;
  }

  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN_LEFT = 20;
  const MARGIN_RIGHT = 20;
  const MARGIN_TOP = 18;
  const MARGIN_BOTTOM = 18;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  const BRAND = "Layanan Nusantara";
  const DATE_TEXT = formatTanggalIndonesia();

  let y = MARGIN_TOP;

  function pageFooter() {
    const pageCount = doc.getNumberOfPages();
    doc.setDrawColor(220);
    doc.line(MARGIN_LEFT, PAGE_HEIGHT - 12, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(BRAND, MARGIN_LEFT, PAGE_HEIGHT - 7);
    doc.text(`Halaman ${pageCount}`, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 7, {
      align: "right",
    });
  }

  function newPage() {
    pageFooter();
    doc.addPage();
    y = MARGIN_TOP;
  }

  function ensureSpace(heightNeeded = 10) {
    if (y + heightNeeded > PAGE_HEIGHT - MARGIN_BOTTOM - 10) {
      newPage();
    }
  }

  function textBlock(text, options = {}) {
    if (!text) return;

    const {
      fontSize = 11,
      lineHeight = 6,
      bold = false,
      color = 50,
      gapAfter = 4,
    } = options;

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(String(text), CONTENT_WIDTH);
    const blockHeight = lines.length * lineHeight;

    ensureSpace(blockHeight + gapAfter);
    doc.text(lines, MARGIN_LEFT, y);
    y += blockHeight + gapAfter;
  }

  function titleBlock(text) {
    if (!text) return;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20);

    const lines = doc.splitTextToSize(String(text), CONTENT_WIDTH);
    const h = lines.length * 9;

    ensureSpace(h + 8);
    doc.text(lines, MARGIN_LEFT, y);
    y += h + 4;
  }

  function sectionHeading(text) {
    if (!text) return;
    ensureSpace(16);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20);
    doc.text(String(text), MARGIN_LEFT, y);
    y += 4;

    doc.setDrawColor(140);
    doc.line(MARGIN_LEFT, y, MARGIN_LEFT + 40, y);
    y += 7;
  }

  function metaGrid(items) {
    const boxGap = 6;
    const boxWidth = (CONTENT_WIDTH - boxGap) / 2;
    const boxHeight = 18;

    for (let i = 0; i < items.length; i += 2) {
      ensureSpace(boxHeight + 4);

      const row = [items[i], items[i + 1]].filter(Boolean);

      row.forEach((item, index) => {
        const x = MARGIN_LEFT + index * (boxWidth + boxGap);
        doc.setDrawColor(225);
        doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(item.label.toUpperCase(), x + 4, y + 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(35);
        doc.text(String(item.value || "-"), x + 4, y + 13);
      });

      y += boxHeight + 4;
    }

    y += 2;
  }

  function infoBox(title, body) {
    if (!title && !body) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const titleLines = doc.splitTextToSize(String(title || ""), CONTENT_WIDTH - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const bodyLines = doc.splitTextToSize(String(body || ""), CONTENT_WIDTH - 10);

    const height =
      8 +
      (titleLines.length ? titleLines.length * 6 : 0) +
      (bodyLines.length ? bodyLines.length * 5.2 : 0) +
      8;

    ensureSpace(height + 4);

    doc.setDrawColor(220);
    doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, height, 3, 3);

    let innerY = y + 7;

    if (titleLines.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(20);
      doc.text(titleLines, MARGIN_LEFT + 5, innerY);
      innerY += titleLines.length * 6 + 1;
    }

    if (bodyLines.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(70);
      doc.text(bodyLines, MARGIN_LEFT + 5, innerY);
    }

    y += height + 6;
  }

  function bulletSummary(title, items) {
    const filtered = (items || []).filter(Boolean);
    if (!filtered.length) return;

    sectionHeading(title);

    filtered.forEach((item, index) => {
      textBlock(`${index + 1}. ${item}`, {
        fontSize: 11,
        lineHeight: 6,
        color: 55,
        gapAfter: 2,
      });
    });

    y += 2;
  }

  function simpleCard(title, desc) {
    if (!title && !desc) return;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const titleLines = doc.splitTextToSize(String(title || "Poin Materi"), CONTENT_WIDTH - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    const descLines = doc.splitTextToSize(String(desc || "-"), CONTENT_WIDTH - 10);

    const height = 8 + titleLines.length * 5.5 + descLines.length * 5 + 8;

    ensureSpace(height + 4);

    doc.setDrawColor(225);
    doc.roundedRect(MARGIN_LEFT, y, CONTENT_WIDTH, height, 3, 3);

    let innerY = y + 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(titleLines, MARGIN_LEFT + 5, innerY);
    innerY += titleLines.length * 5.5 + 2;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(75);
    doc.text(descLines, MARGIN_LEFT + 5, innerY);

    y += height + 5;
  }

  // COVER
  doc.setFillColor(248, 249, 251);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  y = 24;
  textBlock(BRAND, {
    fontSize: 18,
    bold: true,
    color: 20,
    lineHeight: 7,
    gapAfter: 1,
  });

  textBlock("Dokumen Resmi Materi Pembelajaran", {
    fontSize: 10,
    color: 120,
    lineHeight: 5,
    gapAfter: 6,
  });

  doc.setDrawColor(210);
  doc.line(MARGIN_LEFT, y, PAGE_WIDTH - MARGIN_RIGHT, y);
  y += 12;

  if (materi.badge) {
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(MARGIN_LEFT, y, 30, 9, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(67, 56, 202);
    doc.text(String(materi.badge), MARGIN_LEFT + 15, y + 5.8, { align: "center" });
    y += 14;
  }

  titleBlock(materi.judul || "Materi Pembelajaran");

  textBlock(materi.deskripsi || "Dokumen materi pembelajaran.", {
    fontSize: 11.5,
    lineHeight: 6.5,
    color: 70,
    gapAfter: 8,
  });

  metaGrid([
    { label: "Level", value: materi.level || "-" },
    { label: "Durasi", value: materi.durasi || "-" },
    { label: "Fokus", value: materi.fokus || "-" },
    { label: "Tanggal Dibuat", value: DATE_TEXT },
  ]);

  y = 238;

  infoBox(
    "Lisensi Layanan Nusantara",
    "Hak cipta tata letak dokumen, identitas penerbit, serta penyusunan ulang isi menjadi format PDF berada dalam konteks layanan pembelajaran Layanan Nusantara. Gunakan dokumen ini secara bijak untuk kebutuhan belajar, arsip, atau distribusi yang sesuai dengan tujuan edukasi."
  );

  // PAGE 2
  newPage();

  textBlock("MATERI LENGKAP", {
    fontSize: 9,
    bold: true,
    color: 120,
    lineHeight: 4,
    gapAfter: 3,
  });

  titleBlock(materi.judul || "Materi Pembelajaran");

  if (materi.intro) {
    sectionHeading("Pendahuluan");
    textBlock(materi.intro, {
      fontSize: 11,
      lineHeight: 6.2,
      color: 45,
      gapAfter: 7,
    });
  }

  if (materi.highlight) {
    sectionHeading("Highlight Materi");
    infoBox("", materi.highlight);
  }

  if (materi.section1_title || materi.section1_content) {
    sectionHeading(materi.section1_title || "Bagian 1");
    textBlock(materi.section1_content || "-", {
      fontSize: 11,
      lineHeight: 6.2,
      color: 45,
      gapAfter: 7,
    });
  }

  if (materi.section2_title || materi.section2_content) {
    sectionHeading(materi.section2_title || "Bagian 2");
    textBlock(materi.section2_content || "-", {
      fontSize: 11,
      lineHeight: 6.2,
      color: 45,
      gapAfter: 7,
    });
  }

  if (materi.section3_title || materi.section3_content) {
    sectionHeading(materi.section3_title || "Bagian 3");
    textBlock(materi.section3_content || "-", {
      fontSize: 11,
      lineHeight: 6.2,
      color: 45,
      gapAfter: 7,
    });
  }

  const cards = [
    { title: materi.card1_title, desc: materi.card1_desc },
    { title: materi.card2_title, desc: materi.card2_desc },
    { title: materi.card3_title, desc: materi.card3_desc },
    { title: materi.card4_title, desc: materi.card4_desc },
  ].filter((item) => item.title || item.desc);

  if (cards.length) {
    sectionHeading("Poin Tambahan Materi");
    cards.forEach((item) => simpleCard(item.title, item.desc));
  }

  bulletSummary("Ringkasan Lengkap", [
    materi.summary1,
    materi.summary2,
    materi.summary3,
    materi.summary4,
  ]);

  sectionHeading("Penutup");
  textBlock(
    `Dokumen ini disusun agar seluruh isi materi dapat dibaca secara utuh, lengkap, dan profesional dalam format PDF. Materi yang tersedia telah ditampilkan dari awal hingga akhir tanpa diringkas, sehingga tetap nyaman dijadikan arsip, bahan belajar, maupun dokumen pendamping kelas di platform ${BRAND}.`,
    {
      fontSize: 11,
      lineHeight: 6.2,
      color: 55,
      gapAfter: 8,
    }
  );

  infoBox(
    "Catatan Penggunaan",
    "Dokumen ini dibuat otomatis dari data materi di sistem. Format disusun agar stabil ketika diunduh, dicetak, dan dibaca ulang sebagai modul pembelajaran."
  );

  pageFooter();

  const fileName = `${sanitizeFileName(materi.judul || "materi")}-layanan-nusantara.pdf`;
  doc.save(fileName);
}







export default function MateriDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);

  const [progress, setProgress] = useState({
    listened: false,
    uploaded: false,
    reviewed: false,
    completed: false,
  });

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [capturedImage, setCapturedImage] = useState("");
  const [cameraError, setCameraError] = useState("");

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);

    fetch(`/.netlify/functions/materi-detail?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.ok) {
          setMateri(data.data);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil materi:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      if (!selectedVoice && allVoices.length > 0) {
        const priorityVoice =
          allVoices.find((v) => /id|indonesia/i.test(v.lang || "")) ||
          allVoices[0];

        if (priorityVoice) {
          setSelectedVoice(priorityVoice.name);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const narrationText = useMemo(() => buildNarrationText(materi), [materi]);

  const totalProgressSteps = 4;
  const completedSteps = Object.values(progress).filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / totalProgressSteps) * 100);

  function startSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Browser ini belum mendukung text-to-speech.");
      return;
    }

    if (!narrationText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(narrationText);
    const voice = voices.find((v) => v.name === selectedVoice);

    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || "id-ID";
    utterance.rate = Number(speechRate);
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPausedSpeech(false);
      setProgress((prev) => ({ ...prev, listened: true }));
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPausedSpeech(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPausedSpeech(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function pauseSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.pause();
    setIsPausedSpeech(true);
    setIsSpeaking(false);
  }

  function resumeSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.resume();
    setIsPausedSpeech(false);
    setIsSpeaking(true);
  }

  function stopSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPausedSpeech(false);
  }

  function openCamera() {
    setCameraError("");
    setCameraOpen(true);
  }

  function stopCamera() {
    setCameraOpen(false);
  }

  function toggleCameraFacingMode() {
    setCameraError("");
    setCameraFacingMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  }

  function handleCameraError(error) {
    console.error("Webcam error:", error);

    let message = "Kamera gagal dibuka.";

    const errName = error?.name || error?.toString?.() || "";

    if (String(errName).includes("NotAllowedError")) {
      message = "Fitur ini sedang di perbaiki. Silahkan coba lagi nanti .";
    } else if (String(errName).includes("NotFoundError")) {
      message = "Kamera tidak ditemukan di perangkat ini.";
    } else if (String(errName).includes("NotReadableError")) {
      message = "Kamera sedang dipakai aplikasi lain. Tutup aplikasi lain lalu coba lagi.";
    } else if (String(errName).includes("OverconstrainedError")) {
      message = "Mode kamera ini tidak didukung. Coba ganti kamera.";
    } else if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      message = "Kamera hanya bisa dipakai di HTTPS atau localhost.";
    }

    setCameraError(message);
    setCameraOpen(false);
  }

  async function capturePhoto() {
    if (!webcamRef.current) {
      alert("Kamera belum siap.");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      alert("Gagal mengambil foto. Tunggu sebentar lalu coba lagi.");
      return;
    }

    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

      const compressedDataUrl = await compressImageFile(file, 960, 0.72);

      setCapturedImage(compressedDataUrl);
      setReviewResult(null);
      setProgress((prev) => ({ ...prev, uploaded: true }));
    } catch (err) {
      alert(err.message || "Gagal memproses hasil foto");
    }
  }

  async function handleUploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar, misalnya JPG, PNG, WEBP, atau format image lainnya.");
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 960, 0.72);
      setCapturedImage(compressedDataUrl);
      setReviewResult(null);
      setProgress((prev) => ({ ...prev, uploaded: true }));
    } catch (err) {
      alert(err.message || "Gagal memproses gambar");
    } finally {
      event.target.value = "";
    }
  }

  async function runAiReview() {
    if (!capturedImage) {
      alert("Upload gambar atau ambil foto dulu.");
      return;
    }

    const parts = dataUrlToParts(capturedImage);
    if (!parts) {
      alert("Format gambar tidak valid.");
      return;
    }

    const estimatedBytes = estimateBase64SizeInBytes(parts.imageBase64);

    if (estimatedBytes > 900 * 1024) {
      alert("Ukuran gambar masih terlalu besar. Coba foto ulang atau upload gambar yang lebih kecil.");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewResult(null);

      const res = await fetch("/.netlify/functions/ai-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: parts.imageBase64,
          mimeType: parts.mimeType,
          materi,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Gagal mereview gambar");
      }

      setReviewResult(data.data);
      setProgress((prev) => ({ ...prev, reviewed: true }));
    } catch (err) {
      alert(err.message || "Gagal mereview gambar");
    } finally {
      setReviewLoading(false);
    }
  }

  function markComplete() {
    setProgress((prev) => ({ ...prev, completed: true }));
  }

  function goBackToClass() {
    router.push(`/kelas-nusantara/${materi?.kelas_slug || ""}`);
  }

  const videoConstraints = {
    width: 960,
    height: 540,
    facingMode: cameraFacingMode,
  };

  if (loading) {
    return <div className="p-6">Memuat materi...</div>;
  }

  if (!materi) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900">Materi tidak ditemukan</h1>
          <p className="mt-3 text-sm text-gray-600">
            Data materi belum tersedia atau gagal dimuat.
          </p>

          <button
            onClick={() => router.back()}
            className="mt-6 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.back()}
          className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          ← Kembali
        </button>

        <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
          <div className="relative h-[260px] w-full overflow-hidden bg-gray-200">
            <img
              src={
                materi.cover_image ||
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80"
              }
              alt="Cover materi"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <p className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                {materi.badge || "Materi"}
              </p>
              <h1 className="text-3xl font-bold md:text-5xl">{materi.judul}</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">
                {materi.deskripsi}
              </p>
            </div>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_340px] lg:p-10">
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    Level
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {materi.level || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                    Durasi
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {materi.durasi || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                    Fokus
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {materi.fokus || "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-violet-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                    Progress
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {progressPercent}% selesai
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5">
                <h2 className="text-xl font-bold text-gray-900">Audio Reader</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Dengarkan isi materi yang diambil dari spreadsheet.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Pilih Suara
                    </label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    >
                      {voices.length === 0 ? (
                        <option value="">Memuat suara...</option>
                      ) : (
                        voices.map((voice) => (
                          <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Kecepatan
                    </label>
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(Number(e.target.value))}
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    >
                      <option value={0.75}>0.75x</option>
                      <option value={1}>1x</option>
                      <option value={1.15}>1.15x</option>
                      <option value={1.25}>1.25x</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={startSpeaking}
                    className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    ▶ Putar Audio
                  </button>

                  <button
                    onClick={pauseSpeaking}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    ⏸ Pause
                  </button>

                  <button
                    onClick={resumeSpeaking}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    ⏯ Resume
                  </button>

                  <button
                    onClick={stopSpeaking}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    ⏹ Stop
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6">
                <div className="max-w-none text-gray-700">
                  {materi.intro ? <p className="leading-7">{materi.intro}</p> : null}

                  {materi.highlight ? (
                    <div className="my-6 rounded-2xl border-l-4 border-indigo-500 bg-indigo-50 p-5">
                      <p className="m-0 text-sm font-medium text-indigo-900">
                        {materi.highlight}
                      </p>
                    </div>
                  ) : null}

                  {materi.section1_title ? (
                    <>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {materi.section1_title}
                      </h2>
                      <p className="mt-3 leading-7">{materi.section1_content}</p>
                    </>
                  ) : null}

                  {materi.image1 ? (
                    <img
                      src={materi.image1}
                      alt={materi.judul}
                      className="my-6 rounded-2xl"
                    />
                  ) : null}

                  {materi.section2_title ? (
                    <>
                      <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        {materi.section2_title}
                      </h2>
                      <p className="mt-3 leading-7">{materi.section2_content}</p>
                    </>
                  ) : null}

                  {materi.section3_title ? (
                    <>
                      <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        {materi.section3_title}
                      </h2>
                      <p className="mt-3 leading-7">{materi.section3_content}</p>
                    </>
                  ) : null}

                  <div className="my-6 grid gap-4 sm:grid-cols-2">
                    {materi.card1_title ? (
                      <div className="rounded-2xl bg-gray-50 p-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {materi.card1_title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">{materi.card1_desc}</p>
                      </div>
                    ) : null}

                    {materi.card2_title ? (
                      <div className="rounded-2xl bg-gray-50 p-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {materi.card2_title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">{materi.card2_desc}</p>
                      </div>
                    ) : null}

                    {materi.card3_title ? (
                      <div className="rounded-2xl bg-gray-50 p-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {materi.card3_title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">{materi.card3_desc}</p>
                      </div>
                    ) : null}

                    {materi.card4_title ? (
                      <div className="rounded-2xl bg-gray-50 p-5">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {materi.card4_title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">{materi.card4_desc}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Upload Karya untuk Direview AI</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Upload JPG, PNG, hasil desain, poster, layout, atau ambil foto langsung. AI akan mereview sesuai isi materi dari spreadsheet.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={openCamera}
                    className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Buka Kamera
                  </button>

                  <button
                    onClick={toggleCameraFacingMode}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Ganti Kamera
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Upload Gambar / PNG
                  </button>

                  <button
                    onClick={stopCamera}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Tutup Kamera
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                  />
                </div>

                {cameraError ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {cameraError}
                  </div>
                ) : null}

                <div className="mt-4 overflow-hidden rounded-3xl border border-gray-200 bg-black">
                  <div className="relative aspect-video w-full">
                    {cameraOpen ? (
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        mirrored={cameraFacingMode === "user"}
                        screenshotFormat="image/jpeg"
                        screenshotQuality={0.72}
                        videoConstraints={videoConstraints}
                        onUserMedia={() => {
                          setCameraError("");
                        }}
                        onUserMediaError={handleCameraError}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/80">
                        Kamera belum aktif. Kamu juga bisa upload PNG/JPG dari galeri atau hasil desain.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={capturePhoto}
                    className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Ambil Foto
                  </button>

                  <button
                    onClick={runAiReview}
                    disabled={reviewLoading}
                    className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                  >
                    {reviewLoading ? "Mereview..." : "Review dengan AI"}
                  </button>
                </div>

                {capturedImage ? (
                  <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-800">
                      Hasil Upload / Capture
                    </p>
                    <img
                      src={capturedImage}
                      alt="Hasil upload"
                      className="w-full rounded-2xl object-cover"
                    />
                  </div>
                ) : null}

                {reviewResult ? (
                  <div className="mt-4 rounded-3xl border border-violet-100 bg-violet-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-gray-900">AI Review</h3>
                      <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-violet-700">
                        Skor: {reviewResult.score}/100
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-700">
                      Jenis terdeteksi: {reviewResult.detected_type || "-"}
                    </p>

                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                      {reviewResult.summary}
                    </p>

                    <p className="mt-2 text-sm font-medium text-gray-700">
                      Relevan dengan materi: {reviewResult.relevant_to_material ? "Ya" : "Tidak"}
                    </p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-sm font-semibold text-emerald-700">
                          Kelebihan
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                          {(reviewResult.strengths || []).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-sm font-semibold text-amber-700">
                          Saran Perbaikan
                        </p>
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                          {(reviewResult.improvements || []).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="text-lg font-semibold text-gray-900">Ringkasan Cepat</h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                  {materi.summary1 ? <li>• {materi.summary1}</li> : null}
                  {materi.summary2 ? <li>• {materi.summary2}</li> : null}
                  {materi.summary3 ? <li>• {materi.summary3}</li> : null}
                  {materi.summary4 ? <li>• {materi.summary4}</li> : null}
                </ul>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Progress Belajar</h3>

                <div className="mt-4">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{progressPercent}% selesai</p>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span>Dengarkan audio</span>
                    <span>{progress.listened ? "✅" : "⏳"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span>Upload karya</span>
                    <span>{progress.uploaded ? "✅" : "⏳"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span>Review AI</span>
                    <span>{progress.reviewed ? "✅" : "⏳"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <span>Tandai selesai</span>
                    <span>{progress.completed ? "✅" : "⏳"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Aksi Materi</h3>

                <div className="mt-4 flex flex-col gap-3">
                <button
  onClick={() => generateProfessionalPdf(materi)}
  className="rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
>
  Download PDF
</button>

                  <button
                    onClick={startSpeaking}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Dengarkan Materi
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Upload Karya
                  </button>

                  <button
                    onClick={runAiReview}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Review AI
                  </button>

                  <button
                    onClick={markComplete}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Tandai Selesai
                  </button>

                  <button
                    onClick={goBackToClass}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Kembali ke Kelas
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}