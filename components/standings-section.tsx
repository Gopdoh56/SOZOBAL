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

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  home_score: number
  away_score: number
  status: string
  division_id: string
}

interface MatchScore {
  match_id: string
  winning_team_id: string
}

interface TeamStanding extends Team {
  wins: number
  losses: number
  rank: number
  pct: string
  gb: string
}

export default function StandingsSection() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [matchScores, setMatchScores] = useState<MatchScore[]>([])
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()
    
    // Load active divisions
    const { data: divisionsData } = await supabase
      .from('divisions')
      .select('*')
      .eq('is_active', true)
      .order('name')

    // Load all teams
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('is_active', true)

    // Load completed matches - ONLY league games with league_name = 'sozobal'
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'completed')
      .eq('match_type', 'league')
      .ilike('league_name', 'sozobal')

    // Load match scores (to get winning team)
    const { data: matchScoresData } = await supabase
      .from('match_scores')
      .select('match_id, winning_team_id')

    if (divisionsData && divisionsData.length > 0) {
      setDivisions(divisionsData)
      setSelectedDivision(divisionsData[0].id)
    }
    
    if (teamsData) {
      setTeams(teamsData)
    }

    if (matchesData) {
      setMatches(matchesData)
    }

    if (matchScoresData) {
      setMatchScores(matchScoresData)
    }

    setLoading(false)
  }

  // Calculate wins and losses for each team
  const calculateStandings = (divisionId: string): TeamStanding[] => {
    const divisionTeams = teams.filter(team => team.division_id === divisionId)
    
    // Initialize standings
    const standings: TeamStanding[] = divisionTeams.map(team => ({
      ...team,
      wins: 0,
      losses: 0,
      rank: 0,
      pct: "0.000",
      gb: "-"
    }))

    // Get matches for this division
    const divisionMatches = matches.filter(match => match.division_id === divisionId)

    // Calculate wins and losses
    divisionMatches.forEach(match => {
      const matchScore = matchScores.find(ms => ms.match_id === match.id)
      
      if (matchScore && matchScore.winning_team_id) {
        // Use winning_team_id from match_scores table
        const winningTeamId = matchScore.winning_team_id
        const losingTeamId = winningTeamId === match.home_team_id 
          ? match.away_team_id 
          : match.home_team_id

        const winningTeam = standings.find(t => t.id === winningTeamId)
        const losingTeam = standings.find(t => t.id === losingTeamId)

        if (winningTeam) winningTeam.wins++
        if (losingTeam) losingTeam.losses++
      } else if (match.home_score !== match.away_score) {
        // Fallback: use scores if winning_team_id is not set
        const winningTeamId = match.home_score > match.away_score 
          ? match.home_team_id 
          : match.away_team_id
        const losingTeamId = match.home_score > match.away_score 
          ? match.away_team_id 
          : match.home_team_id

        const winningTeam = standings.find(t => t.id === winningTeamId)
        const losingTeam = standings.find(t => t.id === losingTeamId)

        if (winningTeam) winningTeam.wins++
        if (losingTeam) losingTeam.losses++
      }
    })

    // Sort by wins (descending), then by losses (ascending)
    standings.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      return a.losses - b.losses
    })

    // Calculate PCT and GB
    return standings.map((team, index) => {
      const totalGames = team.wins + team.losses
      const pct = totalGames > 0 ? (team.wins / totalGames).toFixed(3) : "0.000"
      
      let gb = "-"
      if (index > 0 && standings.length > 0) {
        const leader = standings[0]
        const gamesBehind = ((leader.wins - team.wins) + (team.losses - leader.losses)) / 2
        gb = gamesBehind.toFixed(1)
      }
      
      return {
        ...team,
        rank: index + 1,
        pct,
        gb
      }
    })
  }

  const divisionTeams = selectedDivision ? calculateStandings(selectedDivision) : []

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
          <p className="text-gray-500">No active divisions found</p>
        </div>
      </section>
    )
  }

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
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-600">#</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-bold text-gray-600">Team</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-gray-600">W</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-gray-600">L</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-gray-600">PCT</th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-bold text-gray-600">GB</th>
              </tr>
            </thead>
            <tbody>
              {divisionTeams.length > 0 ? (
                divisionTeams.map((team) => (
                  <tr key={team.id} className="border-b border-gray-200 hover:bg-gray-100 transition">
                    <td className="px-3 sm:px-4 py-3 sm:py-4 font-bold text-gray-900">{team.rank}</td>
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
                          <div className="text-xs font-bold text-gray-600">{team.short_name || team.name.substring(0, 3).toUpperCase()}</div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900 hidden sm:block">{team.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-gray-900">{team.wins}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-gray-900">{team.losses}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-gray-900">{team.pct}</td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right font-bold text-gray-900">{team.gb}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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