export default function AppOnlyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-bold mb-4">
        Fitur Khusus Aplikasi
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        Blog dan Reward hanya dapat diakses melalui aplikasi
        <strong> Layanan Nusantara</strong>.
      </p>

      <p className="text-sm text-gray-400">
        Silakan install aplikasi untuk melanjutkan.
      </p>
    </div>
  )
}
