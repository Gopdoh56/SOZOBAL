import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Eye } from "lucide-react"
import Image from "next/image"

export function FeaturedNews() {
  const featuredStory = {
    id: 1,
    headline: "SOZOBAL Finals Preview: Lakers vs Celtics Historic Matchup Set for Game 7",
    summary:
      "Two legendary franchises meet in what promises to be an epic conclusion to the 2024 SOZOBAL season. Both teams have overcome incredible odds to reach this moment.",
    category: "Finals",
    author: "Sarah Johnson",
    publishedAt: "6 hours ago",
    readTime: "5 min read",
    views: "12.5K",
    image: "/placeholder.svg?key=finals",
    isFeatured: true,
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Featured Story</h2>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="md:flex">
          <div className="md:w-1/2">
            <Image
              src={featuredStory.image || "/placeholder.svg"}
              alt={featuredStory.headline}
              width={600}
              height={400}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-accent text-accent-foreground">{featuredStory.category}</Badge>
                  <Badge variant="outline">Featured</Badge>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 text-balance">{featuredStory.headline}</h3>
                <p className="text-muted-foreground mb-4 text-pretty">{featuredStory.summary}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>By {featuredStory.author}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredStory.publishedAt}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span>{featuredStory.readTime}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {featuredStory.views}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    </section>
  )
}
