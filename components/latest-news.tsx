export default function LatestNews() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold">Latest News</h2>
        <a href="#" className="text-red-600 font-bold text-sm hover:text-red-700 transition">
          View All →
        </a>
      </div>

      <div className="bg-black rounded-lg overflow-hidden">
        <div className="aspect-video bg-gray-800 flex items-center justify-center">
          <img src="/basketball-game-action.png" alt="NBA game" className="w-full h-full object-cover" />
        </div>

        <div className="p-8 text-white">
          <h3 className="text-3xl font-bold mb-4">FANTASTIC FINISH: VUČEVIĆ'S CLUTCH 3 STUNS BLAZERS</h3>

          <button className="border-2 border-white text-white px-8 py-2 rounded-full font-bold hover:bg-white hover:text-black transition">
            WATCH
          </button>

          <div className="flex gap-2 mt-8 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded ${i === 1 ? "bg-white" : "bg-gray-600"}`}></div>
            ))}
          </div>

          <p className="text-gray-300">Next: Fantastic Finish: Knicks prevail in wild finish</p>
        </div>
      </div>
    </section>
  )
}
