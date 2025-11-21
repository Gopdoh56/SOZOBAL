"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  home_score: number
  away_score: number
  status: string
  home_team?: { name: string; logo_url: string }
  away_team?: { name: string; logo_url: string }
}

export default function ScoresSection() {
  const [activeWeek, setActiveWeek] = useState(0) // 0 = current week, -1 = last week, 1 = next week
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [activeWeek])

  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate start of week (Monday)
    const startOfWeek = new Date(today)
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay
    startOfWeek.setDate(today.getDate() + daysToMonday + (weekOffset * 7))
    startOfWeek.setHours(0, 0, 0, 0)
    
    // Calculate end of week (Sunday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return { startOfWeek, endOfWeek }
  }

  const getWeekLabel = (weekOffset: number) => {
    const { startOfWeek, endOfWeek } = getWeekDates(weekOffset)
    const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const startDay = startOfWeek.getDate()
    const endDay = endOfWeek.getDate()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}`
    }
  }

  const loadMatches = async () => {
    setLoading(true)
    const supabase = createClient()
    
    const { startOfWeek, endOfWeek } = getWeekDates(activeWeek)
    
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url)
      `)
      .gte('match_date', startOfWeek.toISOString())
      .lte('match_date', endOfWeek.toISOString())
      .order('match_date', { ascending: true })
      .limit(3) // <--- THIS LIMITS THE RESULTS TO 3 GAMES ONLY

    if (data) {
      setMatches(data)
    } else if (error) {
      console.error('Error loading matches:', error)
    }
    
    setLoading(false)
  }

  const getStatusDisplay = (status: string, matchDate: string) => {
    const now = new Date()
    const matchTime = new Date(matchDate)
    
    if (status === 'completed') return 'FINAL'
    if (status === 'live') return 'LIVE'
    if (status === 'postponed') return 'POSTPONED'
    if (status === 'cancelled') return 'CANCELLED'
    
    // For scheduled matches, show time
    if (matchTime > now) {
      return matchTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
    
    return 'SCHEDULED'
  }

  const getButtonText = (status: string, matchDate: string) => {
    const now = new Date()
    const matchTime = new Date(matchDate)
    
    if (status === 'live') return '▶ WATCH LIVE'
    if (status === 'completed') return 'VIEW BOX SCORE'
    if (status === 'postponed') return 'POSTPONED'
    if (status === 'cancelled') return 'CANCELLED'
    
    if (matchTime > now) {
      return `▶ GAME STARTS ${matchTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`
    }
    
    return 'GAME INFO'
  }

  const getButtonColor = (status: string) => {
    if (status === 'live') return 'bg-red-500 hover:bg-red-600 text-white'
    if (status === 'completed') return 'bg-gray-600 hover:bg-gray-700 text-white'
    if (status === 'postponed' || status === 'cancelled') return 'bg-gray-400 text-white cursor-not-allowed'
    return 'bg-yellow-400 hover:bg-yellow-300 text-black'
  }

  const getTeamCode = (teamName: string) => {
    // Extract first 3 letters or create abbreviation
    if (!teamName) return 'TBD'
    
    const words = teamName.split(' ')
    if (words.length > 1) {
      return words.map(w => w[0]).join('').toUpperCase().slice(0, 3)
    }
    return teamName.slice(0, 3).toUpperCase()
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-4xl font-bold">Scores</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <h2 className="text-4xl font-bold">Scores</h2>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveWeek(activeWeek - 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          ← Previous Week
        </button>
        
        <div className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold min-w-[200px] text-center">
          {activeWeek === 0 ? 'This Week' : activeWeek === -1 ? 'Last Week' : activeWeek === 1 ? 'Next Week' : getWeekLabel(activeWeek)}
          <div className="text-xs font-normal opacity-90 mt-1">
            {getWeekLabel(activeWeek)}
          </div>
        </div>
        
        <button
          onClick={() => setActiveWeek(activeWeek + 1)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          Next Week →
        </button>
      </div>

      {/* Games */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-500 text-lg">No matches scheduled for this week</p>
          </div>
        ) : (
          matches.map((match) => {
            const matchDate = new Date(match.match_date)
            const dayOfWeek = matchDate.toLocaleDateString('en-US', { weekday: 'long' })
            const dateStr = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            
            return (
              <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    match.status === 'live' ? 'bg-red-100 text-red-700' :
                    match.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {getStatusDisplay(match.status, match.match_date)}
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    {dayOfWeek}, {dateStr}
                  </div>
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {match.home_team?.logo_url ? (
                      <img 
                        src={match.home_team.logo_url} 
                        alt={match.home_team.name} 
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-xs">
                          {getTeamCode(match.home_team?.name || '')}
                        </span>
                      </div>
                    )}
                    <div className="font-semibold text-gray-900">
                      {match.home_team?.name || 'TBD'}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    match.status === 'completed' && match.home_score > match.away_score 
                      ? 'text-orange-600' 
                      : 'text-gray-900'
                  }`}>
                    {match.home_score || 0}
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {match.away_team?.logo_url ? (
                      <img 
                        src={match.away_team.logo_url} 
                        alt={match.away_team.name} 
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-xs">
                          {getTeamCode(match.away_team?.name || '')}
                        </span>
                      </div>
                    )}
                    <div className="font-semibold text-gray-900">
                      {match.away_team?.name || 'TBD'}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    match.status === 'completed' && match.away_score > match.home_score 
                      ? 'text-orange-600' 
                      : 'text-gray-900'
                  }`}>
                    {match.away_score || 0}
                  </div>
                </div>

                <button 
                  className={`w-full flex items-center justify-center gap-2 font-semibold py-2 text-sm rounded-lg transition ${
                    getButtonColor(match.status)
                  }`}
                  disabled={match.status === 'postponed' || match.status === 'cancelled'}
                >
                  {getButtonText(match.status, match.match_date)}
                </button>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}