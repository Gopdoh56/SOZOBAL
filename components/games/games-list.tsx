import { GameCard } from "./game-card"

export function GamesList() {
  const games = [
    {
      id: 1,
      homeTeam: {
        name: "CRAZY WORRIORS",
        logo: "/lakers-basketball-team-logo.png",
        record: "45-20",
      },
      awayTeam: {
        name: "MIKOKO",
        logo: "/warriors-basketball-team-logo.png",
        record: "42-23",
      },
      homeScore: 108,
      awayScore: 112,
      status: "Final",
      quarter: "Final",
      date: "March 15, 2024",
      time: "7:30 PM ET",
      venue: "BYC",
      highlights: ["Ant1: 35 PTS", "Dan: 28 PTS, 12 AST"],
    },
    {
      id: 2,
      homeTeam: {
        name: "CDHIB",
        logo: "/celtics-basketball-team-logo.png",
        record: "48-17",
      },
      awayTeam: {
        name: "LOX 360",
        logo: "/heat-basketball-team-logo.jpg",
        record: "38-27",
      },
      homeScore: 95,
      awayScore: 89,
      status: "Live",
      quarter: "3rd - 8:42",
      date: "March 15, 2024",
      time: "8:00 PM ET",
      venue: "BYC",
      highlights: ["Chiku: 24 PTS", "Butler: 18 PTS"],
    },
    {
      id: 3,
      homeTeam: {
        name: "MUBAS WILDCATS",
        logo: "/bulls-basketball-team-logo.png",
        record: "32-33",
      },
      awayTeam: {
        name: "MUST GOLIRAS",
        logo: "/nets-basketball-team-logo.jpg",
        record: "28-37",
      },
      homeScore: 0,
      awayScore: 0,
      status: "Upcoming",
      quarter: "8:00 PM ET",
      date: "March 15, 2024",
      time: "8:00 PM ET",
      venue: "COM",
      highlights: [],
    },
    {
      id: 4,
      homeTeam: {
        name: "MAGANG'A U23",
        logo: "/nuggets-basketball-team-logo.jpg",
        record: "46-19",
      },
      awayTeam: {
        name: "MUBAS U23",
        logo: "/suns-basketball-team-logo.jpg",
        record: "40-25",
      },
      homeScore: 124,
      awayScore: 118,
      status: "Final",
      quarter: "Final - OT",
      date: "March 14, 2024",
      time: "9:00 PM ET",
      venue: "Ball Arena",
      highlights: ["Jokic: 32 PTS, 15 REB", "Booker: 29 PTS"],
    },
  ]

  return (
    <div className="space-y-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
