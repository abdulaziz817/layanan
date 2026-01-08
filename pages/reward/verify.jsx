import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase();
}

export default function RewardVerify() {
  const router = useRouter();
  const { code, sig } = router.query;
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!code || !sig) return;

    // Validasi minimal: signature harus sesuai format hash
    const expectedSigPattern = /^[0-9A-F]+$/;
    if (expectedSigPattern.test(sig)) {
      setValid(true);
    }
  }, [code, sig]);

  if (!code) return <p>Memuat...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Verifikasi Voucher</h1>
      <p className="mb-2">Kode Voucher: <span className="font-mono">{code}</span></p>
      {valid ? (
        <p className="text-green-600 font-semibold">✔ Voucher valid!</p>
      ) : (
        <p className="text-red-600 font-semibold">❌ Voucher tidak valid!</p>
      )}
    </div>
  );
}
