import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, TrendingUp, Award, Users } from "lucide-react"

const featuredPlayers = [
  {
    id: 1,
    name: "BOYD NAU",
    team: "FDH",
    position: "SF",
    stats: {
      points: 28.5,
      rebounds: 8.2,
      assists: 6.8,
    },
    image: "/lebron-james.jpg",
    achievement: "Player of the Week",
    trending: true,
  },
  {
    id: 2,
    name: "DUMIANI KAWIYA",
    team: "Warriors",
    position: "PG",
    stats: {
      points: 31.2,
      rebounds: 5.1,
      assists: 5.9,
    },
    image: "/stephen-curry.jpg",
    achievement: "3-Point Leader",
    trending: false,
  },
  {
    id: 3,
    name: "HARRIS MBENJERE",
    team: "Bucks",
    position: "PF",
    stats: {
      points: 29.8,
      rebounds: 11.3,
      assists: 5.7,
    },
    image: "/giannis-antetokounmpo.jpg",
    achievement: "Double-Double Streak",
    trending: true,
  },
]

export function PlayerSpotlightSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Player Spotlight</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Featuring the league's top performers and rising stars making headlines
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {featuredPlayers.map((player, index) => (
            <Card
              key={player.id}
              className={`group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                index === 0 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={player.image || "/placeholder.svg"}
                    alt={player.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  {player.trending && (
                    <Badge className="bg-accent text-accent-foreground">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  <Badge variant="secondary">{player.position}</Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-primary-foreground fill-current" />
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{player.name}</h3>
                    <p className="text-muted-foreground">{player.team}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent">{player.achievement}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{player.stats.points}</div>
                      <div className="text-xs text-muted-foreground">PPG</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{player.stats.rebounds}</div>
                      <div className="text-xs text-muted-foreground">RPG</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{player.stats.assists}</div>
                      <div className="text-xs text-muted-foreground">APG</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    View Player Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="bg-transparent">
            <Users className="mr-2 h-4 w-4" />
            View All Players
          </Button>
        </div>
      </div>
    </section>
  )
}
