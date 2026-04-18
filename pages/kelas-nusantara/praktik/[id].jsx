import { useState } from "react";

export default function Page() {
  const [brightness, setBrightness] = useState(100);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Editor Foto</h1>

      <img
        src="/sample.jpg"
        style={{ filter: `brightness(${brightness}%)` }}
        className="mt-4 w-96"
      />

      <input
        type="range"
        min="50"
        max="150"
        value={brightness}
        onChange={(e) => setBrightness(e.target.value)}
        className="mt-4 w-full"
      />
    </div>
  );
}