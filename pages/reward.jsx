import { useEffect, useState } from "react";
import DailyReward from "../components/ui/reward/DailyReward";
import RedeemList from "../components/ui/reward/RedeemList";
import Profile from "../components/ui/profile/Profile";

export default function Reward() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  if (!profile || !profile.verified) {
    return (
      <div className="min-h-screen p-6 pt-28 bg-gray-50 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">🎁 Reward Harian</h1>
        <p className="mb-4 text-gray-600 text-center">
          Untuk mengakses reward, silakan lengkapi profil dan lakukan verifikasi terlebih dahulu.
        </p>
        <Profile onVerified={() => setProfile({ ...profile, verified: true })} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-28 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <h1 className="text-4xl font-bold text-gray-800">🎁 Reward Harian</h1>
        <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
          Kumpulkan coin setiap hari dan tukarkan dengan hadiah menarik. 
          Ikuti aktivitas harian untuk meningkatkan reward-mu!
        </p>
        <DailyReward />
        <RedeemList />
      </div>
    </div>
  );
}
