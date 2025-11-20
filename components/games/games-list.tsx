export const dynamic = 'force-dynamic'
export const revalidate = 0

"use client"

import { useEffect, useState } from "react"
import { GameCard } from "@/components/games/game-card"
import { createClient } from "@/lib/supabase/Client"
import { Loader2 } from "lucide-react"

interface Match {
  id: string
  match_date: string
  status: string
  home_score: number
  away_score: number
  round_number: number
  home_team: {
    name: string
    logo_url: string
    wins: number
    losses: number
  }
  away_team: {
    name: string
    logo_url: string
    wins: number
    losses: number
  }
  venue: {
    name: string
  }
}

interface GamesListProps {
  filter: string
}

export function GamesList({ filter }: GamesListProps) {
  const [games, setGames] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGames()
  }, [filter])

  const loadGames = async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('matches')
      .select(`
        id,
        match_date,
        status,
        home_score,
        away_score,
        round_number,
        home_team:teams!matches_home_team_id_fkey(name, logo_url, wins, losses),
        away_team:teams!matches_away_team_id_fkey(name, logo_url, wins, losses),
        venue:venues(name)
      `)
      .order('match_date', { ascending: false })

    // Apply filters
    if (filter === 'live') {
      query = query.eq('status', 'live')
    } else if (filter === 'completed') {
      query = query.eq('status', 'completed')
    } else if (filter === 'upcoming') {
      query = query.eq('status', 'scheduled')
    } else if (filter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      query = query
        .gte('match_date', today.toISOString())
        .lt('match_date', tomorrow.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading games:', error)
      setLoading(false)
      return
    }

    if (data) {
      setGames(data as Match[])
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No games found for this filter.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {games.map((match) => {
        const matchDate = new Date(match.match_date)
        
        // Determine status display
        let statusDisplay = match.status
        if (match.status === 'live') {
          statusDisplay = 'Live'
        } else if (match.status === 'completed') {
          statusDisplay = 'Final'
        } else if (match.status === 'scheduled') {
          statusDisplay = 'Upcoming'
        }

        // Quarter/period display
        let quarterDisplay = ''
        if (match.status === 'completed') {
          quarterDisplay = 'Final'
        } else if (match.status === 'live') {
          quarterDisplay = 'Live'
        }

        const game = {
          id: parseInt(match.id),
          homeTeam: {
            name: match.home_team?.name || 'TBD',
            logo: match.home_team?.logo_url || '',
            record: `${match.home_team?.wins || 0}-${match.home_team?.losses || 0}`,
          },
          awayTeam: {
            name: match.away_team?.name || 'TBD',
            logo: match.away_team?.logo_url || '',
            record: `${match.away_team?.wins || 0}-${match.away_team?.losses || 0}`,
          },
          homeScore: match.home_score || 0,
          awayScore: match.away_score || 0,
          status: statusDisplay,
          quarter: quarterDisplay,
          date: matchDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          time: matchDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          venue: match.venue?.name || 'TBD',
          highlights: [], // You can add highlights logic if you have a highlights field
        }

        return <GameCard key={match.id} game={game} />
      })}
    </div>
  )
}