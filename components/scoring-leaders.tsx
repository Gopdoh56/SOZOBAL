export default function ScoringLeaders() {
  const leaders = [
    { rank: 1, code: "BOS", name: "Jayson Tatum", team: "BOS", ppg: 30.8 },
    { rank: 2, code: "MIL", name: "Giannis Antetokounmpo", team: "MIL", ppg: 31.2 },
    { rank: 3, code: "DAL", name: "Luka Doncic", team: "DAL", ppg: 32.5 },
    { rank: 4, code: "PHI", name: "Joel Embiid", team: "PHI", ppg: 33.1 },
  ]

  return (
    <section className="space-y-6">
      <h2 className="text-4xl font-bold">Scoring Leaders</h2>

      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <div className="space-y-0">
          {leaders.map((leader) => (
            <div
              key={leader.code}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="font-bold text-gray-900">{leader.name}</div>
                  <div className="text-sm text-gray-600">{leader.team}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{leader.ppg}</div>
                <div className="text-xs text-gray-600">PPG</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
