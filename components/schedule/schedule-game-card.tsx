import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star, Ticket } from "lucide-react"
import Image from "next/image"

interface Game {
  id: number
  homeTeam: string
  awayTeam: string
  time: string
  venue: string
  isFeatured: boolean
  ticketsAvailable: boolean
}

interface ScheduleGameCardProps {
  game: Game
}

export function ScheduleGameCard({ game }: ScheduleGameCardProps) {
  const getTeamLogo = (teamName: string) => {
    const logoMap: { [key: string]: string } = {
      Lakers: "/lakers-basketball-team-logo.png",
      Warriors: "/warriors-basketball-team-logo.png",
      Celtics: "/celtics-basketball-team-logo.png",
      Heat: "/heat-basketball-team-logo.jpg",
      Bulls: "/bulls-basketball-team-logo.png",
      Nets: "/nets-basketball-team-logo.jpg",
      Nuggets: "/nuggets-basketball-team-logo.jpg",
      Clippers: "/clippers-basketball-team-logo.jpg",
      Kings: "/kings-basketball-team-logo.jpg",
      "76ers": "/76ers-basketball-team-logo.jpg",
      Magic: "/magic-basketball-team-logo.jpg",
      Pistons: "/pistons-basketball-team-logo.jpg",
      Timberwolves: "/timberwolves-basketball-team-logo.jpg",
      Knicks: "/knicks-basketball-team-logo.jpg",
    }
    return logoMap[teamName] || "/abstract-basketball-logo.png"
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${game.isFeatured ? "ring-2 ring-accent/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Teams */}
          <div className="flex items-center gap-6 flex-1">
            {/* Away Team */}
            <div className="flex items-center gap-3">
              <Image
                src={getTeamLogo(game.awayTeam) || "/placeholder.svg"}
                alt={`${game.awayTeam} logo`}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold text-foreground">{game.awayTeam}</span>
            </div>

            <span className="text-muted-foreground font-medium">@</span>

            {/* Home Team */}
            <div className="flex items-center gap-3">
              <Image
                src={getTeamLogo(game.homeTeam) || "/placeholder.svg"}
                alt={`${game.homeTeam} logo`}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold text-foreground">{game.homeTeam}</span>
            </div>
          </div>

          {/* Game Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {game.time}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {game.venue}
              </div>
            </div>

            {/* Badges and Actions */}
            <div className="flex items-center gap-2">
              {game.isFeatured && (
                <Badge className="bg-accent text-accent-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}

              {game.ticketsAvailable ? (
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Ticket className="h-4 w-4 mr-2" />
                  Get Tickets
                </Button>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Sold Out
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
