export const dynamic = 'force-dynamic'
export const revalidate = 0
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { createClient } from "@/lib/supabase/Client"
import { Loader2 } from "lucide-react"

interface TeamStanding {
  rank: number
  team: string
  wins: number
  losses: number
  pct: number
  gb: string
  logo: string
  isPlayoff: boolean
  team_id: string
}

interface Division {
  id: string
  name: string
  teams: TeamStanding[]
}

export function ConferenceStandings() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStandings()
  }, [])

  const loadStandings = async () => {
    const supabase = createClient()

    // Get all active divisions with their teams
    const { data: divisionsData, error: divError } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (divError) {
      console.error('Error loading divisions:', divError)
      setLoading(false)
      return
    }

    if (!divisionsData || divisionsData.length === 0) {
      setLoading(false)
      return
    }

    // Load teams for each division
    const divisionsWithTeams: Division[] = []

    for (const division of divisionsData) {
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, logo_url, wins, losses, points')
        .eq('division_id', division.id)
        .eq('is_active', true)
        .order('points', { ascending: false })

      if (teamsError) {
        console.error('Error loading teams:', teamsError)
        continue
      }

      if (teamsData && teamsData.length > 0) {
        // Calculate standings
        const topTeamWins = teamsData[0].wins
        const standings: TeamStanding[] = teamsData.map((team, index) => {
          const totalGames = team.wins + team.losses
          const pct = totalGames > 0 ? team.wins / totalGames : 0
          const gamesBack = index === 0 ? '-' : ((topTeamWins - team.wins) / 2).toFixed(1)
          
          return {
            rank: index + 1,
            team: team.name,
            wins: team.wins,
            losses: team.losses,
            pct: pct,
            gb: gamesBack,
            logo: team.logo_url || '',
            isPlayoff: index < 4, // Top 4 teams make playoffs
            team_id: team.id,
          }
        })

        divisionsWithTeams.push({
          id: division.id,
          name: division.name,
          teams: standings,
        })
      }
    }

    setDivisions(divisionsWithTeams)
    setLoading(false)
  }

  const getTeamInitial = (teamName: string) => {
    return teamName.charAt(0).toUpperCase()
  }

  const StandingsTable = ({ division }: { division: Division }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {division.name}
          <Badge variant="outline">{division.teams.length} Teams</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {division.teams.map((team) => (
            <div
              key={team.team_id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-muted/50 ${
                team.isPlayoff ? "bg-accent/10 border border-accent/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-6">{team.rank}</span>
                {team.logo ? (
                  <Image
                    src={team.logo}
                    alt={`${team.team} logo`}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">
                      {getTeamInitial(team.team)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-foreground">{team.team}</span>
                  {team.isPlayoff && <Badge className="ml-2 text-xs bg-accent text-accent-foreground">Playoff</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="font-medium text-foreground">
                  {team.wins}-{team.losses}
                </span>
                <span className="text-muted-foreground w-12">{team.pct.toFixed(3)}</span>
                <span className="text-muted-foreground w-8">{team.gb}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Current Standings</h2>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (divisions.length === 0) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Current Standings</h2>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No divisions or teams found.</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-foreground mb-6">Current Standings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {divisions.map((division) => (
          <StandingsTable key={division.id} division={division} />
        ))}
      </div>
    </section>
  )
}