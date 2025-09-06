import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, ExternalLink } from "lucide-react"
import Image from "next/image"

interface NewsArticle {
  id: number
  headline: string
  summary: string
  category: string
  author: string
  publishedAt: string
  readTime: string
  views: string
  image: string
  teamLogo?: string
}

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Game Recap":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Trades & Signings":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Injury Reports":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Awards & Honors":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "League News":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-accent text-accent-foreground"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative">
        <Image
          src={article.image || "/placeholder.svg"}
          alt={article.headline}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        {article.teamLogo && (
          <Image
            src={article.teamLogo || "/placeholder.svg"}
            alt="Team logo"
            width={32}
            height={32}
            className="absolute top-3 right-3 rounded-full bg-white/90 p-1"
          />
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {article.views}
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground text-balance hover:text-accent cursor-pointer transition-colors">
          {article.headline}
        </h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-pretty">{article.summary}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>By {article.author}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.publishedAt}
            </div>
            <span>{article.readTime}</span>
          </div>
        </div>

        <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <ExternalLink className="h-4 w-4 mr-2" />
          Read Full Article
        </Button>
      </CardContent>
    </Card>
  )
}
