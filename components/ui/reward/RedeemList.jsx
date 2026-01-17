import { useState, useEffect } from "react";
import { redeemReward, generateRedeemPDF, getCoin } from "../../../utils/reward";

const REWARDS = [
  { name: "ChatGPT Plus 1 Bulan", cost: 2781 },
  { name: "Alight Motion Pro 1 Tahun", cost: 2550 },
  { name: "YouTube Premium 1 Bulan", cost: 2420 },
  { name: "Spotify Premium 1 Bulan", cost: 2510 },
  { name: "Apple Music 1 Bulan", cost: 1850 },
  { name: "Template Desain Website", cost: 1350 },
  { name: "Template Company Profile", cost: 1300 },
  { name: "Template Logo", cost: 1200 },
  { name: "Template Desain Kaos", cost: 1250 },
  { name: "Canva Pro 1 Bulan", cost: 1100 },
  { name: "PicsArt Premium 1 Bulan", cost: 1050 },
  { name: "Premium Icon Pack", cost: 1150 },
  { name: "Viu Unlimited 1 Bulan", cost: 950 },
  { name: "Preset Foto Pemandangan", cost: 900 },
  { name: "Preset Dalam Ruangan", cost: 880 },
  { name: "Preset Luar Ruangan", cost: 880 },
  { name: "Preset Minimalis", cost: 850 },
  { name: "Preset Flat Lay", cost: 830 },
  { name: "Preset Hitam & Putih", cost: 790 },
];

export default function RedeemList() {
  const [coin, setCoin] = useState(0);

  useEffect(() => {
    setCoin(getCoin());
  }, []);

  const handleRedeem = async (reward) => {
    const redeemData = redeemReward(reward.cost, reward.name);

    if (!redeemData) {
      alert("Coinmu tidak cukup 😢");
      return;
    }

    await generateRedeemPDF(redeemData);

    alert("🎉 Redeem berhasil! PDF ter-download");

    setCoin(getCoin());
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-5 md:p-6">
      
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Tukar Reward</h2>
        <p className="text-gray-500 text-sm mt-1">
          Coin kamu: <span className="font-semibold text-black">{coin}</span>
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {REWARDS.map((r) => (
          <div
            key={r.name}
            className="border rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-md transition"
          >
            
            {/* LEFT */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm md:text-base leading-snug">
                {r.name}
              </h3>

              <span className="text-xs text-gray-500 mt-1">
                Harga: {r.cost} Coin
              </span>
            </div>

            {/* BUTTON */}
            <button
              onClick={() => handleRedeem(r)}
              className="
                bg-black text-white
                px-4 py-2
                text-sm
                rounded-lg
                whitespace-nowrap
                hover:bg-gray-900
                active:scale-95
                transition
              "
            >
              Redeem
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}
