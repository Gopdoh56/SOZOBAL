import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, TrendingUp } from "lucide-react"

const teams = [
  {
    id: 1,
    name: "FDH BRICKS",
    city: "BT",
    abbreviation: "FDH",
    record: "45-20",
    conference: "Western",
    color: "bg-purple-600",
    rank: 1,
  },
  {
    id: 2,
    name: "CDHIB MEN",
    city: "BT",
    abbreviation: "CDH",
    record: "48-17",
    conference: "Eastern",
    color: "bg-green-600",
    rank: 1,
  },
  {
    id: 3,
    name: " Crazy Warriors",
    city: "BT",
    abbreviation: "CW",
    record: "42-23",
    conference: "Western",
    color: "bg-blue-600",
    rank: 3,
  },
  {
    id: 4,
    name: "MAGANG'A BOYS",
    city: "ZOMBA",
    abbreviation: "MG",
    record: "41-24",
    conference: "Eastern",
    color: "bg-red-600",
    rank: 4,
  },
  {
    id: 5,
    name: "MIKOKO",
    city: "BT",
    abbreviation: "MKO",
    record: "44-21",
    conference: "Western",
    color: "bg-yellow-600",
    rank: 2,
  },
  {
    id: 6,
    name: "MUBAS WILDCATS",
    city: "BT",
    abbreviation: "MB",
    record: "43-22",
    conference: "Eastern",
    color: "bg-green-700",
    rank: 2,
  },
]

export function TeamsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Team Standings</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Follow your favorite teams and track their performance throughout the season
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teams.map((team) => (
            <Card key={team.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 ${team.color} rounded-full flex items-center justify-center text-white font-bold`}
                    >
                      {team.abbreviation}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">{team.city}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    #{team.rank} {team.conference}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Record</span>
                    <span className="font-semibold">{team.record}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conference</span>
                    <span className="font-medium">{team.conference}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Roster</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>Hot Streak</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="bg-transparent">
            View All Teams
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
