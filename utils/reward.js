// utils/reward.js
import jsPDF from "jspdf";
import QRCode from "qrcode";

const isBrowser = typeof window !== "undefined";

// ====== Coin ======
export function getCoin() {
  if (!isBrowser) return 0;
  return Number(localStorage.getItem("reward_coin") || 0);
}

export function setCoin(value) {
  if (!isBrowser) return;
  localStorage.setItem("reward_coin", value);
}

// ====== Reward harian ======
export function canClaimToday() {
  if (!isBrowser) return false;
  const last = localStorage.getItem("reward_last_claim");
  if (!last) return true;

  const lastDate = new Date(last).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
}

export function claimDailyCoin() {
  if (!isBrowser) return 0;
  if (!canClaimToday()) return 0;

  const coin = Math.floor(Math.random() * 41) + 10;
  const current = getCoin();
  setCoin(current + coin);
  localStorage.setItem("reward_last_claim", new Date().toString());
  return coin;
}

// ====== Redeem reward ======
export function redeemReward(cost, rewardName) {
  if (!isBrowser) return false;
  const current = getCoin();
  if (current < cost) return false;

  setCoin(current - cost);
  return true;
}

// ====== PDF Voucher ======
function generateCode() {
  return `LN-REWARD-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now()}`;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

export async function generateRedeemPDF(rewardName, cost) {
  if (!isBrowser) return;

  const deviceId = localStorage.getItem("device_id") || "UNKNOWN";
  const code = generateCode();
  const date = new Date().toLocaleString("id-ID");

  // ===== Encode data redeem =====
  const rewardData = { rewardName, cost, date };
  const dataStr = btoa(JSON.stringify(rewardData));

  // Signature unik untuk mencegah palsu
  const signature = simpleHash(`${rewardName}|${cost}|${date}|${deviceId}|${code}`);

  // URL QR Code untuk verifikasi
  const verifyURL = `https://layanannusantara.store/reward/verify?code=${code}&sig=${signature}&data=${dataStr}`;

  // Generate QR Code
  const qr = await QRCode.toDataURL(verifyURL);

  // ===== Buat PDF =====
  const doc = new jsPDF();

  // Watermark tipis supaya sulit dicopy
  doc.setTextColor(230);
  doc.setFontSize(40);
  doc.text("LAYANAN NUSANTARA", 35, 140, { angle: 45 });

  // Konten utama PDF
  doc.setTextColor(0);
  doc.setFontSize(18);
  doc.text("🎁 VOUCHER REWARD RESMI", 20, 20);
  doc.setFontSize(11);
  doc.text(`Reward: ${rewardName}`, 20, 40);
  doc.text(`Cost: ${cost} coin`, 20, 50);
  doc.text(`Tanggal: ${date}`, 20, 60);
  doc.text(`Device ID: ${deviceId}`, 20, 70);
  doc.setFontSize(12);
  doc.text(`Kode Voucher: ${code}`, 20, 80);
  doc.setFontSize(10);
  doc.text(`Signature: ${signature}`, 20, 90);

  // QR Code untuk scan & verifikasi
  doc.addImage(qr, "PNG", 140, 55, 40, 40);
  doc.setFontSize(9);
  doc.text("Scan untuk verifikasi voucher", 140, 100);

  // Simpan PDF
  doc.save(`${rewardName}_voucher.pdf`);
}
