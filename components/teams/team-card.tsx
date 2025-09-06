import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import Image from "next/image"

interface Team {
  id: number
  name: string
  city: string
  logo: string
  conference: string
  record: string
  lastGame: {
    opponent: string
    result: string
    score: string
  }
  nextGame: {
    opponent: string
    date: string
    time: string
  }
  keyPlayers: string[]
  coach: string
  arena: string
}

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const isWin = team.lastGame.result === "W"

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={team.logo || "/placeholder.svg"}
              alt={`${team.name} logo`}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {team.city} {team.name}
              </h3>
              <p className="text-sm text-muted-foreground">{team.conference} Conference</p>
            </div>
          </div>
          <Badge className="bg-accent text-accent-foreground">{team.record}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Last Game */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {isWin ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Last Game</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">
              {isWin ? "W" : "L"} vs {team.lastGame.opponent}
            </div>
            <div className="text-xs text-muted-foreground">{team.lastGame.score}</div>
          </div>
        </div>

        {/* Next Game */}
        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Next Game</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-foreground">vs {team.nextGame.opponent}</div>
            <div className="text-xs text-muted-foreground">
              {team.nextGame.date} • {team.nextGame.time}
            </div>
          </div>
        </div>

        {/* Key Players */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Key Players</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {team.keyPlayers.slice(0, 3).map((player, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {player}
              </Badge>
            ))}
          </div>
        </div>

        {/* Team Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{team.arena}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Coach: {team.coach}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
            View Roster
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            Team Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
