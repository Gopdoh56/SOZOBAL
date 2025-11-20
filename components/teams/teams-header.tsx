export const dynamic = 'force-dynamic'
export const revalidate = 0

"use client"

import { useEffect, useState } from "react"
import { Trophy, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/Client"

export function TeamsHeader() {
  const [teamCount, setTeamCount] = useState(0)
  const [currentSeason, setCurrentSeason] = useState('')

  useEffect(() => {
    loadTeamCount()
  }, [])

  const loadTeamCount = async () => {
    const supabase = createClient()

    // Get count of active teams
    const { count, error: countError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (!countError && count !== null) {
      setTeamCount(count)
    }

    // Get current active season
    const { data: divisionData } = await supabase
      .from('divisions')
      .select('season')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (divisionData) {
      setCurrentSeason(divisionData.season)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-8 w-8 text-accent" />
        <h1 className="text-4xl font-bold text-foreground">Teams</h1>
        <Badge className="bg-accent text-accent-foreground">
          {teamCount} {teamCount === 1 ? 'Team' : 'Teams'}
        </Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Explore all SOZOBAL teams, their current standings, roster information, and performance statistics.
      </p>
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>{currentSeason || 'Current Season'} Standings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full"></div>
          <span>Playoff Position</span>
        </div>
      </div>
    </div>
  )
}