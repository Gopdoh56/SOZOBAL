import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star, Ticket } from "lucide-react"
import Image from "next/image"

interface Game {
  id: string
  homeTeam: string
  awayTeam: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  time: string
  venue: string
  isFeatured: boolean
  ticketsAvailable: boolean
}

interface ScheduleGameCardProps {
  game: Game
}

export function ScheduleGameCard({ game }: ScheduleGameCardProps) {
  const getTeamInitial = (teamName: string) => {
    return teamName.charAt(0).toUpperCase()
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${game.isFeatured ? "ring-2 ring-accent/20" : ""}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Teams */}
          <div className="flex items-center gap-6 flex-1">
            {/* Away Team */}
            <div className="flex items-center gap-3">
              {game.awayTeamLogo ? (
                <Image
                  src={game.awayTeamLogo}
                  alt={`${game.awayTeam} logo`}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">{getTeamInitial(game.awayTeam)}</span>
                </div>
              )}
              <span className="font-semibold text-foreground">{game.awayTeam}</span>
            </div>

            <span className="text-muted-foreground font-medium">@</span>

            {/* Home Team */}
            <div className="flex items-center gap-3">
              {game.homeTeamLogo ? (
                <Image
                  src={game.homeTeamLogo}
                  alt={`${game.homeTeam} logo`}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">{getTeamInitial(game.homeTeam)}</span>
                </div>
              )}
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
                  Live
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