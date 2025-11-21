export default function TrendingNow() {
  const trendingItems = [
    { title: "KIA SEASON PREVIEW: BREAKING DOWN ALL 30..." },
    { title: "NBA ROSTERS SET FOR 2025-26 REGULAR..." },
    { title: "POWER RANKINGS: WHERE ALL 30 TEAMS STAND" },
    { title: "DURANT SI 2-YEAR EX" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {trendingItems.map((item, idx) => (
        <div
          key={idx}
          className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 cursor-pointer transition group"
        >
          <div className="h-48 bg-gradient-to-br from-gray-700 to-zinc-900 mb-4" />
          <div className="px-4 pb-4">
            <p className="font-bold text-sm leading-tight group-hover:text-yellow-400 transition">{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
