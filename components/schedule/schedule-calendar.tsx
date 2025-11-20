"use client"

import { useEffect, useState } from "react"
import { ScheduleGameCard } from "./schedule-game-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface Match {
  id: string
  match_date: string
  home_team: { name: string; logo_url: string }
  away_team: { name: string; logo_url: string }
  venue: { name: string }
  status: string
}

interface Game {
  id: string
  homeTeam: string
  awayTeam: string
  homeTeamLogo: string
  awayTeamLogo: string
  time: string
  venue: string
  isFeatured: boolean
  ticketsAvailable: boolean
}

interface ScheduleDay {
  date: string
  dayOfWeek: string
  games: Game[]
}

interface ScheduleCalendarProps {
  filters: {
    viewMode: string
    team: string
    month: string
  }
}

export function ScheduleCalendar({ filters }: ScheduleCalendarProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [filters])

  const loadMatches = async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('matches')
      .select(`
        id,
        match_date,
        status,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url),
        venue:venues(name)
      `)
      .order('match_date', { ascending: true })

    // Filter by team if selected
    if (filters.team && filters.team !== 'all') {
      query = query.or(`home_team_id.eq.${filters.team},away_team_id.eq.${filters.team}`)
    }

    // Filter by month if selected
    if (filters.month && filters.month !== 'all') {
      const [year, month] = filters.month.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      query = query
        .gte('match_date', startDate.toISOString())
        .lte('match_date', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading matches:', error)
      setLoading(false)
      return
    }

    if (data) {
      // Group matches by date
      const grouped = groupMatchesByDate(data as Match[])
      setScheduleData(grouped)
    }

    setLoading(false)
  }

  const groupMatchesByDate = (matches: Match[]): ScheduleDay[] => {
    const grouped = new Map<string, Game[]>()

    matches.forEach((match) => {
      const matchDate = new Date(match.match_date)
      const dateKey = matchDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const game: Game = {
        id: match.id,
        homeTeam: match.home_team?.name || 'TBD',
        awayTeam: match.away_team?.name || 'TBD',
        homeTeamLogo: match.home_team?.logo_url || '',
        awayTeamLogo: match.away_team?.logo_url || '',
        time: matchDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        venue: match.venue?.name || 'TBD',
        isFeatured: match.status === 'live', // Featured if live
        ticketsAvailable: match.status === 'scheduled', // Tickets available if scheduled
      }

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(game)
    })

    // Convert to array format
    const result: ScheduleDay[] = []
    grouped.forEach((games, dateStr) => {
      const date = new Date(games[0].id ? new Date(matches.find(m => m.id === games[0].id)?.match_date || '') : new Date())
      result.push({
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        games,
      })
    })

    return result
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (scheduleData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground text-lg">No matches scheduled for the selected filters.</p>
        </CardContent>
      </Card>
    )
  }

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