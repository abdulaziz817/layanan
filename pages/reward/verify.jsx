import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function RewardVerify() {
  const router = useRouter();
  const { code, sig, data } = router.query;
  const [valid, setValid] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  useEffect(() => {
    if (!code || !sig || !data) return;

    // Cek format signature
    const expectedSigPattern = /^[0-9A-F]+$/;
    if (!expectedSigPattern.test(sig)) {
      setValid(false);
      return;
    }

    setValid(true);

    // Decode reward data dari URL
    try {
      const decoded = JSON.parse(atob(data));
      setRewardData(decoded);
    } catch (err) {
      setRewardData(null);
    }
  }, [code, sig, data]);

  if (!code) return <p>Memuat...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Verifikasi Voucher</h1>
        <div className="mb-4 text-center">
          <p className="text-gray-500">Kode Voucher:</p>
          <p className="font-mono text-lg">{code}</p>
        </div>

        {valid && rewardData ? (
          <div className="space-y-2">
            <p><span className="font-semibold">Reward:</span> {rewardData.rewardName}</p>
            <p><span className="font-semibold">Cost:</span> {rewardData.cost} coin</p>
            <p><span className="font-semibold">Tanggal Redeem:</span> {rewardData.date}</p>
            <p className="text-green-600 font-bold mt-4 text-center">✔ Voucher valid!</p>
          </div>
        ) : (
          <p className="text-red-600 font-bold text-center">❌ Voucher tidak valid!</p>
        )}
      </div>
    </div>
  );
}
