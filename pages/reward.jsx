// pages/reward.jsx
import React from "react";
import DailyReward from "../components/ui/reward/DailyReward";
import RedeemList from "../components/ui/reward/RedeemList";

export default function Reward() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-28">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-6">🎁 Reward Kamu</h1>
        <DailyReward />
        <RedeemList />
      </div>
    </div>
  );
}
