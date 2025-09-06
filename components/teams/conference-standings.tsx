import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function ConferenceStandings() {
  const easternConference = [
    {
      rank: 1,
      team: "CDHIB",
      wins: 48,
      losses: 17,
      pct: 0.738,
      gb: "-",
      logo: "/celtics-basketball-team-logo.png",
      isPlayoff: true,
    },
    {
      rank: 2,
      team: "FDH BRICKS",
      wins: 38,
      losses: 27,
      pct: 0.585,
      gb: "10",
      logo: "/heat-basketball-team-logo.jpg",
      isPlayoff: true,
    },
    {
      rank: 3,
      team: "CRAZY WORRIOUS",
      wins: 32,
      losses: 33,
      pct: 0.492,
      gb: "16",
      logo: "/bulls-basketball-team-logo.png",
      isPlayoff: true,
    },
    {
      rank: 4,
      team: "MAGANG'A",
      wins: 28,
      losses: 37,
      pct: 0.431,
      gb: "20",
      logo: "/nets-basketball-team-logo.jpg",
      isPlayoff: false,
    },
    {
      rank: 5,
      team: "MIKOKO",
      wins: 25,
      losses: 40,
      pct: 0.385,
      gb: "23",
      logo: "/76ers-basketball-team-logo.jpg",
      isPlayoff: false,
    },
    {
      rank: 6,
      team: "MUBAS WILDCATS",
      wins: 22,
      losses: 43,
      pct: 0.338,
      gb: "26",
      logo: "/magic-basketball-team-logo.jpg",
      isPlayoff: false,
    },
  ]

  const westernConference = [
    {
      rank: 1,
      team: "DCE",
      wins: 46,
      losses: 19,
      pct: 0.708,
      gb: "-",
      logo: "/nuggets-basketball-team-logo.jpg",
      isPlayoff: true,
    },
    {
      rank: 2,
      team: "MAGANG'A jnrs",
      wins: 45,
      losses: 20,
      pct: 0.692,
      gb: "1",
      logo: "/lakers-basketball-team-logo.png",
      isPlayoff: true,
    },
    {
      rank: 3,
      team: "MUST U23",
      wins: 42,
      losses: 23,
      pct: 0.646,
      gb: "4",
      logo: "/warriors-basketball-team-logo.png",
      isPlayoff: true,
    },
    {
      rank: 4,
      team: "NEXT GEN",
      wins: 40,
      losses: 25,
      pct: 0.615,
      gb: "6",
      logo: "/clippers-basketball-team-logo.jpg",
      isPlayoff: true,
    },
    {
      rank: 5,
      team: "BASKETBAL INSIGHTS",
      wins: 35,
      losses: 30,
      pct: 0.538,
      gb: "11",
      logo: "/kings-basketball-team-logo.jpg",
      isPlayoff: false,
    },
    {
      rank: 6,
      team: "COBBE",
      wins: 33,
      losses: 32,
      pct: 0.508,
      gb: "13",
      logo: "/timberwolves-basketball-team-logo.jpg",
      isPlayoff: false,
    },
  ]

  const StandingsTable = ({ conference, title }: { conference: typeof easternConference; title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant="outline">{conference.length} Teams</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conference.map((team) => (
            <div
              key={team.team}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                team.isPlayoff ? "bg-accent/10 border border-accent/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">{team.rank}</span>
                <Image
                  src={team.logo || "/placeholder.svg"}
                  alt={`${team.team} logo`}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <span className="font-semibold text-foreground">{team.team}</span>
                  {team.isPlayoff && <Badge className="ml-2 text-xs bg-accent text-accent-foreground">Playoff</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="font-medium text-foreground">
                  {team.wins}-{team.losses}
                </span>
                <span className="text-muted-foreground w-12">{team.pct.toFixed(3)}</span>
                <span className="text-muted-foreground w-8">{team.gb}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Current Standings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StandingsTable conference={easternConference} title="Eastern Conference" />
        <StandingsTable conference={westernConference} title="Western Conference" />
      </div>
    </section>
  )
}
