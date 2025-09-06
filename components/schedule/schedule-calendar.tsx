import { ScheduleGameCard } from "./schedule-game-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ScheduleCalendar() {
  const scheduleData = [
    {
      date: "March 16, 2024",
      dayOfWeek: "Saturday",
      games: [
        {
          id: 1,
          homeTeam: "DCE ",
          awayTeam: "COBBE jnrs",
          time: "8:30 PM ET",
          venue: "DCE",
          isFeatured: true,
          ticketsAvailable: true,
        },
        {
          id: 2,
          homeTeam: "COBBE MEN",
          awayTeam: "CHANGALUME",
          time: "10:00 PM ET",
          venue: "DCE",
          isFeatured: false,
          ticketsAvailable: true,
        },
      ],
    },
    {
      date: "March 17, 2024",
      dayOfWeek: "Sunday",
      games: [
        {
          id: 3,
          homeTeam: "MCA ",
          awayTeam: "UNIMA HAWKS",
          time: "7:00 PM ET",
          venue: "TD Garden",
          isFeatured: true,
          ticketsAvailable: false,
        },
        {
          id: 4,
          homeTeam: "BASKEBALL INSIGHT",
          awayTeam: "NEXT GEN",
          time: "8:00 PM ET",
          venue: "DCE",
          isFeatured: false,
          ticketsAvailable: true,
        },
      ],
    },
    {
      date: "March 18, 2024",
      dayOfWeek: "Monday",
      games: [
        {
          id: 5,
          homeTeam: "MAGANG'A VETS",
          awayTeam: "FDH VETS",
          time: "8:00 PM ET",
          venue: "DCE",
          isFeatured: false,
          ticketsAvailable: true,
        },
      ],
    },
    {
      date: "March 19, 2024",
      dayOfWeek: "Tuesday",
      games: [
        {
          id: 6,
          homeTeam: "KUKOMA EAGLES",
          awayTeam: "CDH LADIE",
          time: "9:00 PM ET",
          venue: "BYC",
          isFeatured: true,
          ticketsAvailable: false,
        },
        {
          id: 7,
          homeTeam: "FDH BRICKS jnrs",
          awayTeam: "CRAZY WORRIORS U23",
          time: "7:30 PM ET",
          venue: "BYC",
          isFeatured: true,
          ticketsAvailable: false,
        },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {scheduleData.map((day) => (
        <Card key={day.date} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground">{day.date}</span>
                <span className="text-lg text-muted-foreground ml-3">{day.dayOfWeek}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {day.games.length} {day.games.length === 1 ? "Game" : "Games"}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {day.games.map((game) => (
                <ScheduleGameCard key={game.id} game={game} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
