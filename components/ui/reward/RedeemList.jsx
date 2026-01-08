import { useState, useEffect } from "react";
import { redeemReward, generateRedeemPDF, getCoin } from "../../../utils/reward";

const REWARDS = [
  { name: "FITUR MASIH DALAM PERBAIKAN", cost: 0 },
  { name: "ChatGPT Plus 1 Bulan", cost: 150 },
  { name: "Premium Icon Pack", cost: 80 },
];

export default function RedeemList() {
  const [coin, setCoin] = useState(0);

  // Ambil coin hanya di browser
  useEffect(() => {
    setCoin(getCoin());
  }, []);

  const handleRedeem = async (reward) => {
    // Lakukan redeem dan dapatkan redeemData asli
    const redeemData = redeemReward(reward.cost, reward.name);

    if (!redeemData) {
      alert("Coinmu tidak cukup 😢");
      return;
    }

    // Generate PDF berdasarkan redeemData (bukan cuma reward & cost)
    await generateRedeemPDF(redeemData);

    alert(`🎉 Redeem berhasil! PDF ter-download, silahkan kirim ke admin via WA`);

    const waLink = `https://wa.me/6287860592111?text=${encodeURIComponent(
      `Halo Admin, saya ingin menukarkan reward ${reward.name}. PDF sudah ter-download.`
    )}`;
    window.open(waLink, "_blank");

    // Update coin terbaru
    setCoin(getCoin());
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Tukar Reward</h2>
      <p className="text-gray-500 mb-4">
        Coinmu: <span className="font-bold">{coin}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REWARDS.map((r) => (
          <div
            key={r.name}
            className="border p-4 rounded-lg flex justify-between items-center hover:shadow-lg transition"
          >
            <div>
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-gray-500">Harga: {r.cost} Coin</p>
            </div>
            <button
              onClick={() => handleRedeem(r)}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
