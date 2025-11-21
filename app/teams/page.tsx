"use client"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'
import { Trophy, TrendingUp, TrendingDown, Users } from 'lucide-react'
// 1. Import the Header component (consistent with the previous page)
import Header from '@/components/nba-header'

interface Team {
  id: string
  name: string
  logo_url: string
  city: string
  home_venue: string
  wins: number
  losses: number
  division?: { name: string }
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [divisions, setDivisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDivision, setSelectedDivision] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [selectedDivision])

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Load divisions
    const { data: divData } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('is_active', true)
    
    if (divData) setDivisions(divData)

    // Load teams
    let query = supabase
      .from('teams')
      .select(`
        *,
        division:divisions(name)
      `)
      .eq('is_active', true)
      .order('wins', { ascending: false })

    if (selectedDivision !== 'all') {
      query = query.eq('division_id', selectedDivision)
    }

    const { data, error } = await query

    if (data) {
      setTeams(data)
    } else if (error) {
      console.error('Error loading teams:', error)
    }
    
    setLoading(false)
  }

  const getWinPercentage = (wins: number, losses: number) => {
    if (wins + losses === 0) return '0.000'
    return ((wins / (wins + losses)) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-black">Teams</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 2. Added Header at the top */}
      <Header />

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Title text-black */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-black">Teams</h1>

        {/* Division Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDivision('all')}
            // Updated text colors to black
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              selectedDivision === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Divisions
          </button>
          {divisions.map((div) => (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              // Updated text colors to black
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedDivision === div.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {div.name}
            </button>
          ))}
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
              {/* text-gray-500 -> text-black */}
              <p className="text-black font-medium">No teams found</p>
            </div>
          ) : (
            teams.map((team, index) => {
              const totalGames = team.wins + team.losses
              const winPct = getWinPercentage(team.wins, team.losses)
              
              return (
                <div key={team.id} className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
                  {/* Team Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-2xl">{team.name[0]}</span>
                        </div>
                      )}

                    </div>
                    
                    <div className="flex-1">
                      {/* Replaced gray-900 with text-black */}
                      <h3 className="text-lg font-bold text-black">{team.name}</h3>
                      {/* Replaced gray-600 with text-black */}
                      <p className="text-sm text-black font-medium">{team.city}</p>
                      <p className="text-xs text-blue-600 font-bold mt-1">{team.division?.name}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      {/* Replaced gray-900 with text-black */}
                      <div className="text-2xl font-bold text-black">{team.wins}</div>
                      {/* Replaced gray-600 with text-black */}
                      <div className="text-xs text-black font-medium">Wins</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-black">{team.losses}</div>
                      <div className="text-xs text-black font-medium">Losses</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="text-2xl font-bold text-blue-600">{winPct}%</div>
                      <div className="text-xs text-black font-medium">Win %</div>
                    </div>
                  </div>

                  {/* Win Streak Indicator */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {/* Replaced gray-600 with text-black */}
                    <span className="text-xs text-black font-medium">
                      {totalGames} games played
                    </span>
                    {team.wins > team.losses ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold">Hot</span>
                      </div>
                    ) : team.losses > team.wins ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-bold">Cold</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-black">
                        <span className="text-xs font-bold">Even</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

