import { User, Award, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function PlayersHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <User className="h-8 w-8 text-accent" />
        <h1 className="text-4xl font-bold text-foreground">Players</h1>
        <Badge className="bg-accent text-accent-foreground">480+ Players</Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Discover the talented athletes of SOZOBAL with comprehensive player profiles, statistics, and achievements.
      </p>
      <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          <span>2024 Season Stats</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Performance Leaders</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span>All-Star Players</span>
        </div>
      </div>
    </div>
  )
}
