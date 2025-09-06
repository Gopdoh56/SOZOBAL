import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, TrendingUp } from "lucide-react"
import Image from "next/image"

interface Team {
  name: string
  logo: string
  record: string
}

interface Game {
  id: number
  homeTeam: Team
  awayTeam: Team
  homeScore: number
  awayScore: number
  status: string
  quarter: string
  date: string
  time: string
  venue: string
  highlights: string[]
}

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-accent text-accent-foreground"
      case "Final":
        return "bg-secondary text-secondary-foreground"
      case "Upcoming":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isLive = game.status === "Live"
  const isUpcoming = game.status === "Upcoming"
  const isFinal = game.status === "Final"

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{game.date}</span>
          </div>
          <Badge className={getStatusColor(game.status)}>
            {isLive && <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />}
            {game.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Teams and Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Away Team */}
          <div className="flex items-center justify-between md:justify-start gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={game.awayTeam.logo || "/placeholder.svg"}
                alt={`${game.awayTeam.name} logo`}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="font-semibold text-foreground">{game.awayTeam.name}</div>
                <div className="text-sm text-muted-foreground">{game.awayTeam.record}</div>
              </div>
            </div>
            {!isUpcoming && <div className="text-2xl font-bold text-foreground">{game.awayScore}</div>}
          </div>

          {/* VS / Score */}
          <div className="text-center">
            {isUpcoming ? (
              <div className="text-muted-foreground font-medium">VS</div>
            ) : (
              <div className="text-sm text-muted-foreground">{game.quarter}</div>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            {!isUpcoming && <div className="text-2xl font-bold text-foreground">{game.homeScore}</div>}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-semibold text-foreground">{game.homeTeam.name}</div>
                <div className="text-sm text-muted-foreground">{game.homeTeam.record}</div>
              </div>
              <Image
                src={game.homeTeam.logo || "/placeholder.svg"}
                alt={`${game.homeTeam.name} logo`}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {game.venue}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {game.time}
          </div>
        </div>

        {/* Highlights */}
        {game.highlights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="font-medium text-foreground">Game Highlights</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {game.highlights.map((highlight, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isLive && (
            <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Watch Live
            </Button>
          )}
          {isFinal && (
            <Button size="sm" variant="outline">
              Game Recap
            </Button>
          )}
          <Button size="sm" variant="outline">
            Box Score
          </Button>
          <Button size="sm" variant="outline">
            Team Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
