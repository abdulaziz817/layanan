import { useState, useEffect } from "react";
import { claimDailyCoin, canClaimToday, getCoin } from "../../../utils/reward";


export default function DailyReward({ onClaim }) {
  const [coin, setCoinState] = useState(0);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    setCoinState(getCoin());
    setClaimed(!canClaimToday());
  }, []);

  const handleClaim = () => {
    if (claimed) {
      alert("Kamu sudah Ambil Coin hari ini 👀");
      return;
    }
    const c = claimDailyCoin();
    if (c) {
      setCoinState(getCoin());
      setClaimed(true);
      alert(`🔥 Kamu dapat ${c} Coin hari ini!`);
      onClaim && onClaim(getCoin());
    }
  };

  return (
   <div className="bg-white shadow-md rounded-xl p-6 text-center">
  <h2 className="text-xl font-bold mb-2">Ambil Hadiah Harianmu!</h2>
  <p className="text-gray-500 mb-4">
    Kamu punya <span className="font-bold">{coin}</span> Coin
  </p>
      <button
        onClick={handleClaim}
        className={`px-6 py-3 rounded-xl text-white font-semibold transition ${
          claimed ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900"
        }`}
      >
        {claimed ? "Coinmu Sudah Diambil" : "Ambil Coinmu!"}
      </button>
    </div>
  );
}
