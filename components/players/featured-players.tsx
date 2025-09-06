import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Zap } from "lucide-react"
import Image from "next/image"

export function FeaturedPlayers() {
  const leaders = [
    {
      category: "Scoring Leader",
      player: "BOYD",
      team: "FDH BRICKS",
      stat: "28.5 PPG",
      icon: Target,
      teamLogo: "/lakers-basketball-team-logo.png",
      playerImage: "/lebron-james-basketball-player.jpg",
    },
    {
      category: "Assists Leader",
      player: "ALNOLD",
      team: "Warriors",
      stat: "9.2 APG",
      icon: Zap,
      teamLogo: "/warriors-basketball-team-logo.png",
      playerImage: "/stephen-curry-basketball-player.jpg",
    },
    {
      category: "Rebounds Leader",
      player: "HARRIS MBENJERE",
      team: "Celtics",
      stat: "11.8 RPG",
      icon: Trophy,
      teamLogo: "/celtics-basketball-team-logo.png",
      playerImage: "/jayson-tatum-basketball-player.jpg",
    },
  ]

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">League Leaders</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaders.map((leader, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <leader.icon className="h-5 w-5 text-accent" />
                {leader.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    src={leader.playerImage || "/placeholder.svg"}
                    alt={leader.player}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <Image
                    src={leader.teamLogo || "/placeholder.svg"}
                    alt={`${leader.team} logo`}
                    width={24}
                    height={24}
                    className="absolute -bottom-1 -right-1 rounded-full border-2 border-background"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{leader.player}</h3>
                  <p className="text-sm text-muted-foreground">{leader.team}</p>
                  <Badge className="mt-1 bg-accent text-accent-foreground">{leader.stat}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
