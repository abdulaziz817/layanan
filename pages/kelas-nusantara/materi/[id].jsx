import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";

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

function getPracticeChallenges(fokus) {
  const fokusText = String(fokus || "").toLowerCase();

  if (fokusText.includes("lighting")) {
    return [
      {
        id: 1,
        title: "Natural Light",
        description: "Ambil foto dekat jendela dengan cahaya alami.",
        tip: "Coba ambil dari arah samping agar bayangan lebih terasa.",
      },
      {
        id: 2,
        title: "Backlight",
        description: "Ambil subjek dengan cahaya dari belakang.",
        tip: "Perhatikan siluet dan detail agar tidak hilang semua.",
      },
      {
        id: 3,
        title: "Soft Light",
        description: "Cari cahaya lembut di pagi atau sore hari.",
        tip: "Golden hour biasanya paling aman untuk latihan.",
      },
      {
        id: 4,
        title: "Indoor Light",
        description: "Latihan memanfaatkan lampu ruangan biasa.",
        tip: "Dekatkan subjek ke sumber cahaya agar hasil lebih bersih.",
      },
    ];
  }

  if (fokusText.includes("editing")) {
    return [
      {
        id: 1,
        title: "Color Tone",
        description: "Coba buat tone warna lebih hangat atau lebih dingin.",
        tip: "Jangan terlalu ekstrem agar foto tetap natural.",
      },
      {
        id: 2,
        title: "Brightness Fix",
        description: "Perbaiki foto yang terlalu gelap atau terlalu terang.",
        tip: "Naikkan pencahayaan sedikit demi sedikit.",
      },
      {
        id: 3,
        title: "Remove Noise",
        description: "Coba perhalus foto agar terlihat lebih bersih.",
        tip: "Kurangi noise tanpa membuat detail hilang.",
      },
      {
        id: 4,
        title: "Simple Retouch",
        description: "Lakukan edit ringan agar objek lebih menonjol.",
        tip: "Fokus pada kontras, warna, dan ketajaman.",
      },
    ];
  }

  if (fokusText.includes("komposisi")) {
    return [
      {
        id: 1,
        title: "Rule of Thirds",
        description: "Posisikan subjek tidak pas di tengah.",
        tip: "Aktifkan grid dan letakkan objek di titik pertemuan garis.",
      },
      {
        id: 2,
        title: "Leading Lines",
        description: "Cari garis yang mengarahkan mata ke subjek.",
        tip: "Gunakan jalan, pagar, meja, atau lorong.",
      },
      {
        id: 3,
        title: "Framing",
        description: "Gunakan objek sekitar sebagai bingkai.",
        tip: "Pintu, jendela, atau daun bisa jadi frame alami.",
      },
      {
        id: 4,
        title: "Negative Space",
        description: "Buat ruang kosong luas di sekitar subjek.",
        tip: "Background polos bikin hasil lebih kuat.",
      },
    ];
  }

  return [
    {
      id: 1,
      title: "Rule of Thirds",
      description: "Ambil foto objek utama dan posisikan tidak pas di tengah.",
      tip: "Aktifkan grid dan letakkan objek di titik pertemuan garis.",
    },
    {
      id: 2,
      title: "Leading Lines",
      description: "Cari garis jalan, meja, pagar, atau lorong yang mengarahkan mata ke subjek.",
      tip: "Gunakan garis alami di sekitar untuk memimpin fokus.",
    },
    {
      id: 3,
      title: "Side Light",
      description: "Foto objek dengan cahaya datang dari samping.",
      tip: "Dekat jendela biasanya paling gampang untuk latihan ini.",
    },
    {
      id: 4,
      title: "Negative Space",
      description: "Buat subjek kecil dengan ruang kosong yang luas di sekelilingnya.",
      tip: "Background polos bikin hasil lebih kuat.",
    },
  ];
}

function simulateAiReview({ challenge, hasImage, fokus }) {
  if (!hasImage) {
    return {
      score: 0,
      summary: "Belum ada foto untuk direview.",
      strengths: [],
      improvements: ["Ambil atau upload foto dulu untuk mendapatkan review."],
    };
  }

  const fokusText = String(fokus || "").toLowerCase();

  if (fokusText.includes("lighting")) {
    return {
      score: 85,
      summary: "Kontrol cahaya sudah lumayan bagus. Tinggal diperkuat arah cahaya dan keseimbangan area terang gelap.",
      strengths: [
        "Cahaya utama sudah cukup terasa.",
        "Objek terlihat lebih hidup dengan permainan cahaya.",
        "Eksperimen pencahayaan sudah mulai kelihatan.",
      ],
      improvements: [
        "Coba hindari highlight yang terlalu keras.",
        "Atur posisi objek agar bayangan lebih menarik.",
      ],
    };
  }

  if (fokusText.includes("editing")) {
    return {
      score: 83,
      summary: "Edit sudah enak dilihat. Tinggal dijaga supaya tidak berlebihan dan tetap natural.",
      strengths: [
        "Tone warna sudah mulai terbentuk.",
        "Hasil edit membuat foto terasa lebih menarik.",
        "Kamu sudah mulai paham arah edit yang diinginkan.",
      ],
      improvements: [
        "Kurangi edit berlebih agar detail tetap aman.",
        "Perhatikan keseimbangan warna dan kontras.",
      ],
    };
  }

  if (fokusText.includes("komposisi")) {
    return {
      score: 84,
      summary: "Komposisi sudah cukup rapi. Tinggal diperkuat penempatan subjek dan arah visual.",
      strengths: [
        "Penempatan subjek sudah cukup enak dilihat.",
        "Framing awal sudah terasa lebih terarah.",
        "Kamu sudah memikirkan susunan visual, bukan asal foto.",
      ],
      improvements: [
        "Coba eksplor angle yang lebih kuat.",
        "Bersihkan background agar fokus lebih jelas.",
      ],
    };
  }

  return {
    score: 82,
    summary: "Latihan awal sudah bagus. Lanjutkan eksplor cahaya, framing, dan fokus subjek.",
    strengths: [
      "Subjek sudah cukup jelas terlihat.",
      "Komposisi awal sudah lumayan rapi untuk tahap pemula.",
      "Kamu sudah mulai memikirkan framing.",
    ],
    improvements: [
      "Coba eksplor angle yang lebih kuat.",
      "Pastikan background tidak terlalu ramai.",
    ],
  };
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
    practiced: false,
    reviewed: false,
    completed: false,
  });

  const [selectedChallengeId, setSelectedChallengeId] = useState(1);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [capturedImage, setCapturedImage] = useState("");
  const [cameraError, setCameraError] = useState("");
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
      stopCamera();
    };
  }, []);

  const challenges = useMemo(
    () => getPracticeChallenges(materi?.fokus),
    [materi?.fokus]
  );

  const selectedChallenge = useMemo(
    () => challenges.find((item) => item.id === selectedChallengeId) || challenges[0],
    [challenges, selectedChallengeId]
  );

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

  async function startCamera(nextFacingMode = cameraFacingMode) {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser tidak mendukung akses kamera.");
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setProgress((prev) => ({ ...prev, practiced: true }));
    } catch (error) {
      console.error(error);
      setCameraError(
        "Kamera gagal dibuka. Pastikan izin kamera sudah diizinkan, atau coba pakai HTTPS / localhost."
      );
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function toggleCameraFacingMode() {
    const nextMode = cameraFacingMode === "environment" ? "user" : "environment";
    setCameraFacingMode(nextMode);
    if (cameraOpen) {
      await startCamera(nextMode);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);

    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(imageData);
  }

  function handleUploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result?.toString() || "");
      setProgress((prev) => ({ ...prev, practiced: true }));
    };
    reader.readAsDataURL(file);
  }

  function runAiReview() {
    const result = simulateAiReview({
      challenge: selectedChallenge,
      hasImage: Boolean(capturedImage),
      fokus: materi?.fokus,
    });

    setReviewResult(result);

    if (capturedImage) {
      setProgress((prev) => ({ ...prev, reviewed: true }));
    }
  }

  function markComplete() {
    setProgress((prev) => ({ ...prev, completed: true }));
  }

  function goNextMateri() {
    router.push("/kelas-nusantara");
  }

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
                    {materi.level || "Beginner"}
                  </p>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                    Durasi
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {materi.durasi || "5 menit"}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                    Fokus
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-800">
                    {materi.fokus || "Pembelajaran"}
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
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Audio AI Reader</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Dengarkan materi dibacakan langsung dari browser.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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

                <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
                  Status:
                  <span className="ml-2 font-semibold text-gray-800">
                    {isSpeaking
                      ? "Sedang membacakan materi"
                      : isPausedSpeech
                      ? "Audio dijeda"
                      : "Belum diputar / sudah selesai"}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6">
                <div className="max-w-none text-gray-700">
                  {materi.intro ? (
                    <p className="leading-7">{materi.intro}</p>
                  ) : null}

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
                  <h2 className="text-xl font-bold text-gray-900">Mode Praktik</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Praktik langsung sesuai fokus materi ini.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">Pilih Tantangan</p>

                    <div className="mt-3 space-y-3">
                      {challenges.map((challenge) => {
                        const active = challenge.id === selectedChallengeId;
                        return (
                          <button
                            key={challenge.id}
                            onClick={() => setSelectedChallengeId(challenge.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              active
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <p className="text-sm font-semibold text-gray-900">
                              {challenge.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              {challenge.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedChallenge ? (
                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedChallenge.title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {selectedChallenge.description}
                        </p>

                        <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                          <span className="font-semibold">Tip:</span> {selectedChallenge.tip}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => startCamera(cameraFacingMode)}
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
                        Upload dari Galeri
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
                      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {cameraError}
                      </div>
                    ) : null}

                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-black">
                      <div className="relative aspect-video w-full">
                        {cameraOpen ? (
                          <>
                            <video
                              ref={videoRef}
                              className="h-full w-full object-cover"
                              autoPlay
                              muted
                              playsInline
                            />

                            <div className="pointer-events-none absolute inset-0">
                              <div className="absolute left-1/3 top-0 h-full w-px bg-white/40" />
                              <div className="absolute left-2/3 top-0 h-full w-px bg-white/40" />
                              <div className="absolute top-1/3 left-0 h-px w-full bg-white/40" />
                              <div className="absolute top-2/3 left-0 h-px w-full bg-white/40" />
                            </div>
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/80">
                            Kamera belum aktif. Tekan tombol <b className="mx-1">Buka Kamera</b>
                            untuk mulai praktik.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={capturePhoto}
                        className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Ambil Foto
                      </button>

                      <button
                        onClick={runAiReview}
                        className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                      >
                        Review dengan AI
                      </button>
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    {capturedImage ? (
                      <div className="rounded-3xl border border-gray-200 bg-white p-4">
                        <p className="mb-3 text-sm font-semibold text-gray-800">
                          Hasil Foto / Upload
                        </p>
                        <img
                          src={capturedImage}
                          alt="Hasil capture"
                          className="w-full rounded-2xl object-cover"
                        />
                      </div>
                    ) : null}

                    {reviewResult ? (
                      <div className="rounded-3xl border border-violet-100 bg-violet-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-lg font-bold text-gray-900">AI Review</h3>
                          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-violet-700">
                            Skor: {reviewResult.score}/100
                          </div>
                        </div>

                        <p className="mt-3 text-sm text-gray-700">{reviewResult.summary}</p>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-sm font-semibold text-emerald-700">
                              Kelebihan
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                              {reviewResult.strengths.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-2xl bg-white p-4">
                            <p className="text-sm font-semibold text-amber-700">
                              Saran Perbaikan
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
                              {reviewResult.improvements.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
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
                    <span>Praktik materi</span>
                    <span>{progress.practiced ? "✅" : "⏳"}</span>
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
                  {materi.pdf_url ? (
                    <a
                      href={materi.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Download PDF
                    </a>
                  ) : (
                    <button className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
                      Download PDF
                    </button>
                  )}

                  <button
                    onClick={startSpeaking}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Dengarkan Materi
                  </button>

                  <button
                    onClick={() => startCamera(cameraFacingMode)}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Mulai Praktik
                  </button>

                  <button
                    onClick={runAiReview}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Minta Review AI
                  </button>

                  <button
                    onClick={markComplete}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Tandai Selesai
                  </button>

                  <button
                    onClick={goNextMateri}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Kembali ke Daftar Kelas
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