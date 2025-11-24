"use client"

import { useState, useEffect } from "react"
import { createClient } from '@/lib/supabase/Client'

interface Division {
  id: string
  name: string
  season: string
  is_active: boolean
}

interface Team {
  id: string
  name: string
  short_name: string
  logo_url: string
  team_color: string
  division_id: string
}

interface TeamStanding extends Team {
  wins: number
  losses: number
  games_played: number
  rank: number
  pts: number
}

export default function StandingsSection() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [standings, setStandings] = useState<{ [divisionId: string]: TeamStanding[] }>({})
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    
    console.log('🔄 === LOADING DATA ===')
    
    // Load active divisions
    const { data: divisionsData, error: divError } = await supabase
      .from('divisions')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (divError) {
      console.error('❌ Error loading divisions:', divError)
      setLoading(false)
      return
    }

    console.log('📁 Divisions loaded:', divisionsData?.length || 0)

    if (divisionsData && divisionsData.length > 0) {
      setDivisions(divisionsData)
      setSelectedDivision(divisionsData[0].id)
      
      // Load standings for all divisions
      const allStandings: { [divisionId: string]: TeamStanding[] } = {}
      
      for (const division of divisionsData) {
        const divisionStandings = await calculateStandingsForDivision(division.id, supabase)
        allStandings[division.id] = divisionStandings
      }
      
      setStandings(allStandings)
    }

    setLoading(false)
    console.log('✅ === DATA LOADING COMPLETE ===')
  }

  const calculateStandingsForDivision = async (divisionId: string, supabase: any): Promise<TeamStanding[]> => {
    console.log('🏆 === CALCULATING STANDINGS FOR DIVISION ===', divisionId)
    
    // Get all teams in this division
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('division_id', divisionId)
      .eq('is_active', true)

    if (teamsError) {
      console.error('❌ Error loading teams:', teamsError)
      return []
    }

    console.log('👥 Teams in division:', teamsData?.length || 0)

    if (!teamsData || teamsData.length === 0) {
      return []
    }

    // Get all completed Sozobal league matches
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        status,
        match_type,
        league_name,
        division_id
      `)
      .eq('status', 'completed')
      .eq('match_type', 'league')
      .ilike('league_name', '%sozobal%')

    if (matchesError) {
      console.error('❌ Error loading matches:', matchesError)
      return []
    }

    console.log('🏀 Total Sozobal matches:', matchesData?.length || 0)

    // Get match scores (winning team info)
    const { data: matchScoresData, error: scoresError } = await supabase
      .from('match_scores')
      .select('match_id, winning_team_id')

    if (scoresError) {
      console.error('❌ Error loading match scores:', scoresError)
    }

    console.log('📊 Match scores loaded:', matchScoresData?.length || 0)

    // Create a map for quick lookup
    const matchScoresMap = new Map(
      matchScoresData?.map(ms => [ms.match_id, ms.winning_team_id]) || []
    )

    // Initialize standings
    const standingsMap = new Map<string, TeamStanding>()
    teamsData.forEach(team => {
      standingsMap.set(team.id, {
        ...team,
        wins: 0,
        losses: 0,
        games_played: 0,
        rank: 0,
        pts: 0
      })
    })

    // Get team IDs in this division
    const divisionTeamIds = new Set(teamsData.map(t => t.id))

    // Process matches
    let matchesProcessed = 0
    matchesData?.forEach(match => {
      const homeTeam = standingsMap.get(match.home_team_id)
      const awayTeam = standingsMap.get(match.away_team_id)

      // Only count matches where BOTH teams are in this division
      if (!homeTeam || !awayTeam) {
        return
      }

      matchesProcessed++
      console.log(`⚡ Match ${matchesProcessed}: ${homeTeam.name} (${match.home_score}) vs ${awayTeam.name} (${match.away_score})`)

      // Increment games played
      homeTeam.games_played++
      awayTeam.games_played++

      // Determine winner
      let winningTeamId = matchScoresMap.get(match.id)
      
      // Fallback to score if winning_team_id not set
      if (!winningTeamId && match.home_score !== match.away_score) {
        winningTeamId = match.home_score > match.away_score ? match.home_team_id : match.away_team_id
      }

      if (winningTeamId) {
        if (winningTeamId === match.home_team_id) {
          homeTeam.wins++
          awayTeam.losses++
          console.log(`   ✅ ${homeTeam.name} wins`)
        } else {
          awayTeam.wins++
          homeTeam.losses++
          console.log(`   ✅ ${awayTeam.name} wins`)
        }
      } else {
        console.log('   ⚠️ Match is a tie or no winner determined')
      }
    })

    console.log(`📊 Processed ${matchesProcessed} matches for this division`)

    // Convert map to array and calculate points (3 per win)
    const standingsArray = Array.from(standingsMap.values()).map(team => ({
      ...team,
      pts: team.wins * 3
    }))
    
    // Sort by points first, then wins, then losses
    standingsArray.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.wins !== a.wins) return b.wins - a.wins
      if (a.losses !== b.losses) return a.losses - b.losses
      return 0
    })

    // Add rankings
    const finalStandings = standingsArray.map((team, index) => ({
      ...team,
      rank: index + 1
    }))

    console.log('🏆 === FINAL STANDINGS ===')
    finalStandings.forEach(team => {
      console.log(`${team.rank}. ${team.name} - GP:${team.games_played} W:${team.wins} L:${team.losses} PTS:${team.pts}`)
    })

    return finalStandings
  }

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = document.getElementById('tabs-container')
    if (container) {
      const scrollAmount = 200
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold">Standings</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700"></div>
        </div>
      </section>
    )
  }

  if (divisions.length === 0) {
    return (
      <section className="space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold">Standings</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-black">No active divisions found</p>
        </div>
      </section>
    )
  }

  const divisionTeams = selectedDivision ? standings[selectedDivision] || [] : []

  return (
    <section className="space-y-6">
      <h2 className="text-3xl sm:text-4xl font-bold">Standings</h2>

      {/* Division Tabs with Scroll */}
      <div className="relative">
        {divisions.length > 3 && (
          <>
            <button
              onClick={() => scrollTabs('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              onClick={() => scrollTabs('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition"
              aria-label="Scroll right"
            >
              →
            </button>
          </>
        )}
        
        <div 
          id="tabs-container"
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {divisions.map((division) => (
            <button
              key={division.id}
              onClick={() => setSelectedDivision(division.id)}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                selectedDivision === division.id
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {division.name}
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100">
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-black">#</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-black">Team</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-black">GP</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-black">W</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-black">L</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-black">PTS</th>
              </tr>
            </thead>
            <tbody>
              {divisionTeams.length > 0 ? (
                divisionTeams.map((team) => (
                  <tr key={team.id} className="border-b border-gray-200 hover:bg-gray-100 transition">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 font-bold text-black">{team.rank}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {team.logo_url ? (
                          <img 
                            src={team.logo_url} 
                            alt={team.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                            style={{ backgroundColor: team.team_color }}
                          >
                            {team.short_name?.[0] || team.name[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-black">{team.short_name || team.name.substring(0, 3).toUpperCase()}</div>
                          <div className="text-xs sm:text-sm font-bold text-black hidden sm:block">{team.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-black">{team.games_played}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-black">{team.wins}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-black">{team.losses}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-black">{team.pts}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-black">
                    No teams in this division yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}