import { Trophy, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function TeamsHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-8 w-8 text-accent" />
        <h1 className="text-4xl font-bold text-foreground">Teams</h1>
        <Badge className="bg-accent text-accent-foreground">24 Teams</Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Explore all SOZOBAL teams, their current standings, roster information, and performance statistics.
      </p>
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>2024 Season Standings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span>Playoff Position</span>
        </div>
      </div>
    </div>
  )
}
