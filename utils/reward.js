// utils/reward.js
import jsPDF from "jspdf";
import QRCode from "qrcode";

const isBrowser = typeof window !== "undefined";

// ------------------- COIN -------------------
export function getCoin() {
  if (!isBrowser) return 0;
  return Number(localStorage.getItem("reward_coin") || 0);
}

export function setCoin(value) {
  if (!isBrowser) return;
  localStorage.setItem("reward_coin", value);
}

// ------------------- REWARD HARIAN -------------------
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

// ------------------- REDEEM REWARD -------------------
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

export function redeemReward(cost, rewardName) {
  if (!isBrowser) return null;

  const current = getCoin();
  if (current < cost) return null;

  setCoin(current - cost);

  const date = new Date().toLocaleString("id-ID");
  const deviceId = localStorage.getItem("device_id") || "UNKNOWN";
  const code = `LN-REWARD-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now()}`;
  const signature = simpleHash(`${rewardName}|${cost}|${date}|${deviceId}|${code}`);

  const redeemData = {
    rewardName,
    cost,
    date,
    code,
    deviceId,
    signature
  };

  // Simpan semua redeem ke localStorage
  const oldRedeems = JSON.parse(localStorage.getItem("reward_redeems") || "[]");
  oldRedeems.push(redeemData);
  localStorage.setItem("reward_redeems", JSON.stringify(oldRedeems));

  return redeemData;
}

// ------------------- PDF VOUCHER -------------------
export async function generateRedeemPDF(redeemData) {
  if (!isBrowser || !redeemData) return;

  const { rewardName, cost, date, code, deviceId, signature } = redeemData;
  const verifyURL = `https://layanannusantara.store/reward/verify?code=${code}&sig=${signature}&data=${btoa(JSON.stringify(redeemData))}`;
  const qr = await QRCode.toDataURL(verifyURL);

  const doc = new jsPDF();

  // Watermark tipis
  doc.setTextColor(230);
  doc.setFontSize(40);
  doc.text("LAYANAN NUSANTARA", 35, 140, { angle: 45 });

  // Konten utama
  doc.setTextColor(0);
  doc.setFontSize(18);
  doc.text("🎁 VOUCHER REWARD RESMI", 20, 20);
  doc.setFontSize(12);
  doc.text(`Reward: ${rewardName}`, 20, 40);
  doc.text(`Cost: ${cost} coin`, 20, 50);
  doc.text(`Tanggal Redeem: ${date}`, 20, 60);
  doc.text(`Device ID: ${deviceId}`, 20, 70);
  doc.setFontSize(11);
  doc.text(`Kode Voucher: ${code}`, 20, 80);
  doc.setFontSize(10);
  doc.text(`Signature: ${signature}`, 20, 90);

  // QR Code yang lebih kecil dan tidak mepet tepi
  doc.addImage(qr, "PNG", 150, 55, 40, 40); // <-- 40x40 mm, posisi agak ke tengah halaman
  doc.setFontSize(9);
  doc.text("Scan untuk verifikasi voucher", 150, 100);

  doc.save(`${rewardName}_voucher.pdf`);
}
