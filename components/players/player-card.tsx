import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, User, Award } from "lucide-react"
import Image from "next/image"

interface Player {
  id: number
  name: string
  team: string
  position: string
  number: number
  age: number
  height: string
  weight: string
  stats: {
    points: number
    rebounds: number
    assists: number
    fieldGoalPct: number
  }
  teamLogo: string
  playerImage: string
  isAllStar: boolean
  achievements: string[]
}

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={player.playerImage || "/placeholder.svg"}
                alt={player.name}
                width={60}
                height={60}
                className="rounded-full"
              />
              <Image
                src={player.teamLogo || "/placeholder.svg"}
                alt={`${player.team} logo`}
                width={24}
                height={24}
                className="absolute -bottom-1 -right-1 rounded-full border-2 border-background"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{player.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">#{player.number}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{player.team}</span>
              </div>
            </div>
          </div>
          {player.isAllStar && (
            <Badge className="bg-accent text-accent-foreground">
              <Star className="h-3 w-3 mr-1" />
              All-Star
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Player Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Position:</span>
            <span className="ml-2 font-medium text-foreground">{player.position}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Age:</span>
            <span className="ml-2 font-medium text-foreground">{player.age}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Height:</span>
            <span className="ml-2 font-medium text-foreground">{player.height}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Weight:</span>
            <span className="ml-2 font-medium text-foreground">{player.weight}</span>
          </div>
        </div>

        {/* Season Stats */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">2024 Season Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Points:</span>
              <span className="font-medium text-foreground">{player.stats.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rebounds:</span>
              <span className="font-medium text-foreground">{player.stats.rebounds}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assists:</span>
              <span className="font-medium text-foreground">{player.stats.assists}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">FG%:</span>
              <span className="font-medium text-foreground">{(player.stats.fieldGoalPct * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Key Achievements</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {player.achievements.slice(0, 2).map((achievement, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {achievement}
              </Badge>
            ))}
            {player.achievements.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{player.achievements.length - 2} more
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            Player Stats
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
