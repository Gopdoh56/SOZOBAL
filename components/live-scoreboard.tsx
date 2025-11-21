export default function LiveScoreboard() {
  return (
    <div className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-sm font-bold text-gray-400 mb-3">GAMES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { team1: "Rockets", team2: "Thunder", score1: 102, score2: 98 },
            { team1: "Warriors", team2: "Lakers", score1: 115, score2: 108 },
            { team1: "Cavaliers", team2: "Knicks", score1: 0, score2: 0 },
            { team1: "Nets", team2: "Hornets", score1: 0, score2: 0 },
          ].map((game, idx) => (
            <div key={idx} className="bg-black rounded-lg p-4 hover:bg-zinc-800 cursor-pointer transition">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">{game.team1}</span>
                <span className="text-lg font-bold">{game.score1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">{game.team2}</span>
                <span className="text-lg font-bold">{game.score2}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Final</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
