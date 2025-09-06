import { PlayerCard } from "./player-card"

export function PlayersGrid() {
  const players = [
    {
      id: 1,
      name: "BOYD NDAWU",
      team: "FDH BRICKS",
      position: "SF",
      number: 6,
      age: 39,
      height: "6'9\"",
      weight: "250 lbs",
      stats: {
        points: 28.5,
        rebounds: 8.2,
        assists: 6.8,
        fieldGoalPct: 0.525,
      },
      teamLogo: "/lakers-basketball-team-logo.png",
      playerImage: "/lebron-james-basketball-player.jpg",
      isAllStar: true,
      achievements: ["4x NBA Champion", "4x Finals MVP", "19x All-Star"],
    },
    {
      id: 2,
      name: "Alnord",
      team: "Warriors",
      position: "PG",
      number: 30,
      age: 36,
      height: "6'2\"",
      weight: "185 lbs",
      stats: {
        points: 26.8,
        rebounds: 4.5,
        assists: 9.2,
        fieldGoalPct: 0.427,
      },
      teamLogo: "/warriors-basketball-team-logo.png",
      playerImage: "/stephen-curry-basketball-player.jpg",
      isAllStar: true,
      achievements: ["4x NBA Champion", "2x MVP", "10x All-Star"],
    },
    {
      id: 3,
      name: "Mike Chimombo",
      team: "FDH",
      position: "SF",
      number: 0,
      age: 26,
      height: "6'8\"",
      weight: "210 lbs",
      stats: {
        points: 24.1,
        rebounds: 11.8,
        assists: 4.9,
        fieldGoalPct: 0.468,
      },
      teamLogo: "/celtics-basketball-team-logo.png",
      playerImage: "/jayson-tatum-basketball-player.jpg",
      isAllStar: true,
      achievements: ["5x All-Star", "All-NBA First Team", "ECF Champion"],
    },
    {
      id: 4,
      name: "Desire",
      team: "Magang'a",
      position: "SF",
      number: 22,
      age: 34,
      height: "6'7\"",
      weight: "230 lbs",
      stats: {
        points: 22.9,
        rebounds: 5.3,
        assists: 5.1,
        fieldGoalPct: 0.493,
      },
      teamLogo: "/heat-basketball-team-logo.jpg",
      playerImage: "/jimmy-butler-basketball-player.jpg",
      isAllStar: true,
      achievements: ["6x All-Star", "Finals Appearance", "All-Defensive Team"],
    },
    {
      id: 5,
      name: "Vincent Gwengwe",
      team: "Magang'a",
      position: "SG",
      number: 11,
      age: 34,
      height: "6'6\"",
      weight: "220 lbs",
      stats: {
        points: 21.4,
        rebounds: 4.1,
        assists: 3.8,
        fieldGoalPct: 0.481,
      },
      teamLogo: "/bulls-basketball-team-logo.png",
      playerImage: "/demar-derozan-basketball-player.jpg",
      isAllStar: false,
      achievements: ["6x All-Star", "All-NBA Team", "Scoring Champion"],
    },
    {
      id: 6,
      name: "ian Fuhala",
      team: "Cobbe",
      position: "SF",
      number: 1,
      age: 27,
      height: "6'6\"",
      weight: "209 lbs",
      stats: {
        points: 19.6,
        rebounds: 4.5,
        assists: 3.3,
        fieldGoalPct: 0.437,
      },
      teamLogo: "/nets-basketball-team-logo.jpg",
      playerImage: "/mikal-bridges-basketball-player.jpg",
      isAllStar: false,
      achievements: ["All-Defensive Team", "Iron Man Award", "Clutch Player"],
    },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6">All Players</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </section>
  )
}
