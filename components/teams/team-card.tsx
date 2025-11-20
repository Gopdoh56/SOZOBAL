
export const dynamic = 'force-dynamic'
export const revalidate = 0"use client"

import { useEffect, useState } from "react"
import { TeamCard } from "./team-card"
import { createClient } from "@/lib/supabase/Client"
import { Loader2 } from "lucide-react"

interface Team {
  id: number
  name: string
  city: string
  logo: string
  conference: string
  record: string
  lastGame: {
    opponent: string
    result: string
    score: string
  }
  nextGame: {
    opponent: string
    date: string
    time: string
  }
  keyPlayers: string[]
  coach: string
  arena: string
}

export function TeamsGrid() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    const supabase = createClient()

    // Load teams with their division info
    const { data: teamsData, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        home_city,
        logo_url,
        wins,
        losses,
        coach_name,
        division:divisions(name)
      `)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error loading teams:', error)
      setLoading(false)
      return
    }

    if (!teamsData) {
      setLoading(false)
      return
    }

    // For each team, get their last and next match
    const teamsWithMatches = await Promise.all(
      teamsData.map(async (team) => {
        // Get last completed match
        const { data: lastMatch } = await supabase
          .from('matches')
          .select(`
            home_score,
            away_score,
            home_team_id,
            away_team_id,
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name)
          `)
          .eq('status', 'completed')
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
          .order('match_date', { ascending: false })
          .limit(1)
          .single()

        // Get next scheduled match
        const { data: nextMatch } = await supabase
          .from('matches')
          .select(`
            match_date,
            home_team_id,
            away_team_id,
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name)
          `)
          .eq('status', 'scheduled')
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
          .order('match_date', { ascending: true })
          .limit(1)
          .single()

        // Process last game
        let lastGame = {
          opponent: 'N/A',
          result: 'N/A',
          score: 'N/A'
        }

        if (lastMatch) {
          const isHome = lastMatch.home_team_id === team.id
          const opponent = isHome ? lastMatch.away_team?.name : lastMatch.home_team?.name
          const teamScore = isHome ? lastMatch.home_score : lastMatch.away_score
          const opponentScore = isHome ? lastMatch.away_score : lastMatch.home_score
          const result = teamScore > opponentScore ? 'W' : 'L'

          lastGame = {
            opponent: opponent || 'Unknown',
            result,
            score: `${teamScore}-${opponentScore}`
          }
        }

        // Process next game
        let nextGame = {
          opponent: 'N/A',
          date: 'TBD',
          time: 'TBD'
        }

        if (nextMatch) {
          const isHome = nextMatch.home_team_id === team.id
          const opponent = isHome ? nextMatch.away_team?.name : nextMatch.home_team?.name
          const matchDate = new Date(nextMatch.match_date)

          nextGame = {
            opponent: opponent || 'Unknown',
            date: matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          }
        }

        // Get top players for this team
        const { data: players } = await supabase
          .from('players')
          .select('first_name, last_name')
          .eq('team_id', team.id)
          .eq('is_active', true)
          .limit(3)

        const keyPlayers = players?.map(p => `${p.first_name} ${p.last_name}`) || []

        return {
          id: parseInt(team.id),
          name: team.name,
          city: team.home_city || '',
          logo: team.logo_url || '',
          conference: team.division?.name || 'Unknown Division',
          record: `${team.wins}-${team.losses}`,
          lastGame,
          nextGame,
          keyPlayers,
          coach: team.coach_name || 'TBD',
          arena: team.home_city || 'Home Arena'
        }
      })
    )

    setTeams(teamsWithMatches)
    setLoading(false)
  }

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">All Teams</h2>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (teams.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">All Teams</h2>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No teams found.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6">All Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </section>
  )
}