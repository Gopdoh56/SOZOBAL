import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

export function BreakingNews() {
  const breakingNews = [
    {
      id: 1,
      headline: "FDH BRICKS Trade Deadline Move: Acquire All-Star Forward",
      time: "2 hours ago",
    },
    {
      id: 2,
      headline: "CDHIB PIA Extend Winning Streak to 12 Games After Victory Over COBBE",
      time: "4 hours ago",
    },
  ]

  return (
    <Card className="mb-8 border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <Badge className="bg-red-600 text-white">Breaking News</Badge>
        </div>
        <div className="space-y-2">
          {breakingNews.map((news) => (
            <div key={news.id} className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground hover:text-accent cursor-pointer transition-colors">
                {news.headline}
              </h3>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">{news.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
