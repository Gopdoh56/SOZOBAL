import { Newspaper, Clock, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function NewsHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Newspaper className="h-8 w-8 text-accent" />
        <h1 className="text-4xl font-bold text-foreground">News</h1>
        <Badge className="bg-accent text-accent-foreground">Latest Updates</Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Stay informed with the latest SOZOBAL news, game recaps, player updates, trades, and league announcements.
      </p>
      <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Updated Daily</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Trending Stories</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span>Breaking News</span>
        </div>
      </div>
    </div>
  )
}
