export default function ProgressBar({ current, total }) {
  const percent = (current / total) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-blue-600 h-3 rounded-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}