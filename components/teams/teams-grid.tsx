import { TeamCard } from "./team-card"

export function TeamsGrid() {
  const teams = [
    {
      id: 1,
      name: "Lakers",
      city: "Los Angeles",
      logo: "/lakers-basketball-team-logo.png",
      conference: "Western",
      record: "45-20",
      lastGame: { opponent: "Warriors", result: "W", score: "112-108" },
      nextGame: { opponent: "Clippers", date: "Mar 16", time: "8:30 PM" },
      keyPlayers: ["LeBron James", "Anthony Davis", "Russell Westbrook"],
      coach: "Darvin Ham",
      arena: "Crypto.com Arena",
    },
    {
      id: 2,
      name: "Warriors",
      city: "Golden State",
      logo: "/warriors-basketball-team-logo.png",
      conference: "Western",
      record: "42-23",
      lastGame: { opponent: "Lakers", result: "L", score: "108-112" },
      nextGame: { opponent: "Kings", date: "Mar 16", time: "10:00 PM" },
      keyPlayers: ["Stephen Curry", "Klay Thompson", "Draymond Green"],
      coach: "Steve Kerr",
      arena: "Chase Center",
    },
    {
      id: 3,
      name: "Celtics",
      city: "Boston",
      logo: "/celtics-basketball-team-logo.png",
      conference: "Eastern",
      record: "48-17",
      lastGame: { opponent: "Heat", result: "W", score: "95-89" },
      nextGame: { opponent: "76ers", date: "Mar 17", time: "7:00 PM" },
      keyPlayers: ["Jayson Tatum", "Jaylen Brown", "Marcus Smart"],
      coach: "Joe Mazzulla",
      arena: "TD Garden",
    },
    {
      id: 4,
      name: "Heat",
      city: "Miami",
      logo: "/heat-basketball-team-logo.jpg",
      conference: "Eastern",
      record: "38-27",
      lastGame: { opponent: "Celtics", result: "L", score: "89-95" },
      nextGame: { opponent: "Magic", date: "Mar 17", time: "8:00 PM" },
      keyPlayers: ["Jimmy Butler", "Bam Adebayo", "Tyler Herro"],
      coach: "Erik Spoelstra",
      arena: "FTX Arena",
    },
    {
      id: 5,
      name: "Bulls",
      city: "Chicago",
      logo: "/bulls-basketball-team-logo.png",
      conference: "Eastern",
      record: "32-33",
      lastGame: { opponent: "Pistons", result: "W", score: "105-98" },
      nextGame: { opponent: "Nets", date: "Mar 18", time: "8:00 PM" },
      keyPlayers: ["DeMar DeRozan", "Zach LaVine", "Nikola Vucevic"],
      coach: "Billy Donovan",
      arena: "United Center",
    },
    {
      id: 6,
      name: "Nets",
      city: "Brooklyn",
      logo: "/nets-basketball-team-logo.jpg",
      conference: "Eastern",
      record: "28-37",
      lastGame: { opponent: "Knicks", result: "L", score: "102-108" },
      nextGame: { opponent: "Bulls", date: "Mar 18", time: "8:00 PM" },
      keyPlayers: ["Mikal Bridges", "Nic Claxton", "Cam Johnson"],
      coach: "Jacque Vaughn",
      arena: "Barclays Center",
    },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6">All Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </section>
  )
}
