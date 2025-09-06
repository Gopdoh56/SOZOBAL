import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, Newspaper } from "lucide-react"

const newsArticles = [
  {
    id: 1,
    title: "CDHIB Secure Victory in Overtime Thriller Against Warriors",
    excerpt:
      "BOYD leads the charge with 35 points as Lakers overcome 15-point deficit to win 112-108 in overtime.",
    category: "Game Recap",
    timeAgo: "2 hours ago",
    image: "/basketball-action.png",
    featured: true,
  },
  {
    id: 2,
    title: "Trade Deadline Approaching: Top Players on the Move",
    excerpt: "Several All-Star players could be changing teams as the February trade deadline approaches.",
    category: "Trade News",
    timeAgo: "4 hours ago",
    image: "/basketball-trade-news.jpg",
    featured: false,
  },
  {
    id: 3,
    title: "Rookie of the Year Race Heats Up",
    excerpt: "Three standout rookies are making their case for the prestigious award with stellar performances.",
    category: "Awards",
    timeAgo: "6 hours ago",
    image: "/young-basketball-player.jpg",
    featured: false,
  },
  {
    id: 4,
    title: "Injury Update: Star Player Expected to Return Next Week",
    excerpt: "Medical team optimistic about quick recovery after successful treatment and rehabilitation.",
    category: "Injury Report",
    timeAgo: "8 hours ago",
    image: "/basketball-medical-team.jpg",
    featured: false,
  },
  {
    id: 5,
    title: "Championship Odds Shift After Recent Performances",
    excerpt: "Betting markets react to recent team performances as playoff picture becomes clearer.",
    category: "Analysis",
    timeAgo: "12 hours ago",
    image: "/basketball-championship-trophy.jpg",
    featured: false,
  },
]

export function NewsSection() {
  const featuredArticle = newsArticles.find((article) => article.featured)
  const regularArticles = newsArticles.filter((article) => !article.featured)

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Latest News</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Stay informed with the latest basketball news, trades, and game highlights
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Featured Article */}
          {featuredArticle && (
            <div className="lg:col-span-2">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={featuredArticle.image || "/placeholder.svg"}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">Featured</Badge>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{featuredArticle.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {featuredArticle.timeAgo}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-balance group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-muted-foreground text-pretty">{featuredArticle.excerpt}</p>
                    <Button
                      variant="outline"
                      className="bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Read Full Story
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Regular Articles */}
          <div className="space-y-6">
            {regularArticles.slice(0, 4).map((article) => (
              <Card key={article.id} className="group hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.timeAgo}
                        </div>
                      </div>
                      <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="bg-transparent">
            <Newspaper className="mr-2 h-4 w-4" />
            View All News
          </Button>
        </div>
      </div>
    </section>
  )
}
