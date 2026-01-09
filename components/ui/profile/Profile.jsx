"use client";

import { useState, useEffect } from "react";

export default function Profile({ onVerified }) {
  const [profile, setProfile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  const startVerification = () => {
    if (!profile) return;
    const newProfile = { ...profile, verification_start: Date.now() };
    localStorage.setItem("userProfile", JSON.stringify(newProfile));
    setProfile(newProfile);
    setVerifying(true);
    setTimer(5 * 60); // 5 menit
  };

  useEffect(() => {
    if (!verifying) return;
    if (timer <= 0) {
      const newProfile = { ...profile, verified: true, verification_start: null };
      localStorage.setItem("userProfile", JSON.stringify(newProfile));
      setProfile(newProfile);
      setVerifying(false);
      alert("Proses verifikasi selesai ✅, sekarang kamu bisa akses reward");
      if (onVerified) onVerified();
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [verifying, timer]);

  if (!profile) return null;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Profil Kamu</h2>

      <div className="space-y-2">
        <p><strong>Nama:</strong> {profile.name || "-"}</p>
        <p><strong>Username:</strong> {profile.username || "-"}</p>
        <p><strong>Phone:</strong> {profile.phone || "-"}</p>
        <p><strong>Hobby:</strong> {profile.hobby || "-"}</p>
        <p><strong>Country:</strong> {profile.country || "-"}</p>
        <p><strong>Coin:</strong> {profile.coin}</p>
        <p><strong>Verified:</strong> {profile.verified ? "✅" : "❌"}</p>
      </div>

      {!profile.verified && !verifying && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={startVerification}
        >
          Verifikasi Profil
        </button>
      )}

      {verifying && (
        <p className="text-gray-600">
          Sedang memverifikasi... {Math.floor(timer / 60)}:{("0" + (timer % 60)).slice(-2)}
        </p>
      )}
    </div>
  );
}
