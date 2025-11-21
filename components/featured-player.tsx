export default function FeaturedPlayer() {
  return (
    <section className="space-y-6">
      <h2 className="text-4xl font-bold">Featured Player</h2>

      <div className="bg-gradient-to-br from-gray-800 to-black rounded-lg overflow-hidden">
        <div className="aspect-square bg-gray-800 flex items-center justify-center">
          <img src="/basketball-player-red-jersey.png" alt="Jayson Tatum" className="w-full h-full object-cover" />
        </div>

        <div className="p-8 text-white">
          <div className="bg-red-700 inline-block px-4 py-2 rounded mb-4">
            <span className="text-sm font-bold">PLAYER OF THE WEEK</span>
          </div>

          <h3 className="text-4xl font-bold mb-2">Jayson Tatum</h3>
          <p className="text-gray-400 mb-6">Forward • #0 • Boston Celtics</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-white">30.8</div>
              <div className="text-sm text-gray-400">PPG</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">8.9</div>
              <div className="text-sm text-gray-400">RPG</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.6</div>
              <div className="text-sm text-gray-400">APG</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
