import { Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ScheduleHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="h-8 w-8 text-accent" />
        <h1 className="text-4xl font-bold text-foreground">Schedule</h1>
        <Badge className="bg-accent text-accent-foreground">2024 Season</Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Stay up to date with all upcoming SOZOBAL games, including dates, times, venues, and ticket information.
      </p>
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>All times shown in ET</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span>Featured Games</span>
        </div>
      </div>
    </div>
  )
}
