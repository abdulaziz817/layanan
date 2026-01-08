import PwaOnly from '@/components/guards/PwaOnly'
import DailyReward from '../components/ui/reward/DailyReward'
import RedeemList from '../components/ui/reward/RedeemList'

export default function Reward() {
  return (
    <PwaOnly>
      <div className="min-h-screen bg-gray-50 p-6 pt-28">
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          {/* Judul utama */}
          <h1 className="text-4xl font-bold text-gray-800">
            🎁 Reward Harian
          </h1>

          {/* Deskripsi */}
          <p className="text-lg text-gray-600 mt-4 max-w-xl mx-auto">
            Kumpulkan coin setiap hari dan tukarkan dengan hadiah menarik.
            Ikuti aktivitas harian untuk meningkatkan reward-mu!
          </p>

          {/* Komponen reward */}
          <DailyReward />
          <RedeemList />
        </div>
      </div>
    </PwaOnly>
  )
}
