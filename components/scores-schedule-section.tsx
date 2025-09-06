import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar, Trophy } from "lucide-react"

const todayGames = [
  {
    id: 1,
    homeTeam: { name: "MIKOKO", abbreviation: "MKO", score: 108 },
    awayTeam: { name: "CRAZY WARRIOUS", abbreviation: "CW", score: 112 },
    status: "Final",
    time: "10:30 PM ET",
  },
  {
    id: 2,
    homeTeam: { name: "FDH BRICKS", abbreviation: "FDH", score: 95 },
    awayTeam: { name: "MUBAS WILDCATS", abbreviation: "MUB", score: 89 },
    status: "Q4 2:34",
    time: "Live",
  },
  {
    id: 3,
    homeTeam: { name: "MAGANG'A", abbreviation: "MGA", score: null },
    awayTeam: { name: "MUST", abbreviation: "MUS", score: null },
    status: "Upcoming",
    time: "11:00 PM ET",
  },
]

const upcomingGames = [
  {
    id: 4,
    homeTeam: { name: "BASKETBALL INSIGHTS", abbreviation: "BSI" },
    awayTeam: { name: "MUST U23", abbreviation: "MST" },
    date: "Tomorrow",
    time: "8:00 PM ET",
  },
  {
    id: 5,
    homeTeam: { name: "NEXT GEN", abbreviation: "NXG" },
    awayTeam: { name: "DCE", abbreviation: "DCE" },
    date: "Tomorrow",
    time: "8:30 PM ET",
  },
  {
    id: 6,
    homeTeam: { name: "CRAZY WORRIOUS U23", abbreviation: "CHI" },
    awayTeam: { name: "MUBAS U23", abbreviation: "DET" },
    date: "Feb 15",
    time: "7:00 PM ET",
  },
]

export function ScoresScheduleSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Scores & Schedule</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Stay up to date with live scores and upcoming games
          </p>
        </div>

        <Tabs defaultValue="today" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Today's Games
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {todayGames.map((game) => (
              <Card key={game.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8 flex-1">
                      {/* Away Team */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {game.awayTeam.abbreviation}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{game.awayTeam.name}</p>
                          <p className="text-sm text-muted-foreground">Away</p>
                        </div>
                        {game.awayTeam.score !== null && (
                          <span className="text-2xl font-bold ml-auto">{game.awayTeam.score}</span>
                        )}
                      </div>

                      {/* VS */}
                      <div className="text-muted-foreground font-medium">VS</div>

                      {/* Home Team */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        {game.homeTeam.score !== null && (
                          <span className="text-2xl font-bold mr-auto">{game.homeTeam.score}</span>
                        )}
                        <div className="min-w-0 text-right">
                          <p className="font-semibold truncate">{game.homeTeam.name}</p>
                          <p className="text-sm text-muted-foreground">Home</p>
                        </div>
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                          {game.homeTeam.abbreviation}
                        </div>
                      </div>
                    </div>

                    {/* Game Status */}
                    <div className="text-right ml-6">
                      <Badge
                        variant={
                          game.status === "Live" || game.time === "Live"
                            ? "destructive"
                            : game.status === "Final"
                              ? "secondary"
                              : "outline"
                        }
                        className="mb-2"
                      >
                        {game.status === "Live" || game.time === "Live" ? "LIVE" : game.status}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {game.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingGames.map((game) => (
              <Card key={game.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8 flex-1">
                      {/* Away Team */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {game.awayTeam.abbreviation}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{game.awayTeam.name}</p>
                          <p className="text-sm text-muted-foreground">Away</p>
                        </div>
                      </div>

                      {/* VS */}
                      <div className="text-muted-foreground font-medium">VS</div>

                      {/* Home Team */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="min-w-0 text-right">
                          <p className="font-semibold truncate">{game.homeTeam.name}</p>
                          <p className="text-sm text-muted-foreground">Home</p>
                        </div>
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                          {game.homeTeam.abbreviation}
                        </div>
                      </div>
                    </div>

                    {/* Game Time */}
                    <div className="text-right ml-6">
                      <Badge variant="outline" className="mb-2">
                        {game.date}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        {game.time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="bg-transparent">
            View Full Schedule
          </Button>
        </div>
      </div>
    </section>
  )
}
