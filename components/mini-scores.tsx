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

export default function MiniScores() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(0)

  useEffect(() => {
    loadMatches()
  }, [activeWeek])

  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const currentDay = today.getDay()
    
    const startOfWeek = new Date(today)
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay
    startOfWeek.setDate(today.getDate() + daysToMonday + (weekOffset * 7))
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return { startOfWeek, endOfWeek }
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
    
    if (status === 'live') return '▶ LIVE'
    if (status === 'completed') return 'BOX SCORE'
    if (status === 'postponed') return 'POSTPONED'
    if (status === 'cancelled') return 'CANCELLED'
    
    if (matchTime > now) {
      return `▶ STARTS`
    }
    
    return 'INFO'
  }

  const getButtonColor = (status: string) => {
    if (status === 'live') return 'text-red-600 bg-red-50 hover:bg-red-100'
    if (status === 'completed') return 'text-gray-600 hover:bg-gray-100'
    if (status === 'postponed' || status === 'cancelled') return 'text-gray-400 cursor-not-allowed'
    return 'text-yellow-500 hover:bg-yellow-50'
  }

  const handlePrevWeek = () => setActiveWeek(activeWeek - 1)
  const handleNextWeek = () => setActiveWeek(activeWeek + 1)

  if (loading) {
    return (
      <section className="bg-gray-100 px-2 py-4 sm:px-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </section>
    )
  }

  const { startOfWeek, endOfWeek } = getWeekDates(activeWeek)

  return (
    <section className="bg-gray-100 px-2 py-4 sm:px-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {/* Date Sidebar */}
          <div className="flex flex-col items-center justify-between bg-white rounded-lg p-2 min-w-16 sm:min-w-20 text-center border border-gray-200 flex-shrink-0">
            <button 
              onClick={handlePrevWeek}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ▲
            </button>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 whitespace-pre-line leading-tight">
              {startOfWeek.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
              <br />
              {startOfWeek.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              <br />
              {startOfWeek.getDate()}
            </span>
            <button 
              onClick={handleNextWeek}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ▼
            </button>
          </div>

          {/* Game Cards */}
          {matches.length === 0 ? (
            <div className="bg-white rounded-lg p-6 border border-gray-200 min-w-64 flex items-center justify-center">
              <p className="text-gray-500 text-sm">No matches this week</p>
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg p-3 border border-gray-200 min-w-64 sm:min-w-72 flex-shrink-0">
                <div className="text-[10px] sm:text-xs font-bold text-gray-500 mb-2">
                  {getStatusDisplay(match.status, match.match_date)}
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {match.home_team?.logo_url ? (
                      <img 
                        src={match.home_team.logo_url} 
                        alt={match.home_team.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-[10px]">
                          {match.home_team?.name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    <span className="font-semibold text-xs sm:text-sm">
                      {match.home_team?.name || 'TBD'}
                    </span>
                  </div>
                  <span className={`text-xl sm:text-2xl font-bold ${
                    match.status === 'completed' && match.home_score > match.away_score 
                      ? 'text-orange-600' 
                      : 'text-gray-900'
                  }`}>
                    {match.home_score || 0}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {match.away_team?.logo_url ? (
                      <img 
                        src={match.away_team.logo_url} 
                        alt={match.away_team.name}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-[10px]">
                          {match.away_team?.name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    <span className="font-semibold text-xs sm:text-sm">
                      {match.away_team?.name || 'TBD'}
                    </span>
                  </div>
                  <span className={`text-xl sm:text-2xl font-bold ${
                    match.status === 'completed' && match.away_score > match.home_score 
                      ? 'text-orange-600' 
                      : 'text-gray-900'
                  }`}>
                    {match.away_score || 0}
                  </span>
                </div>

                {/* Action Button */}
                <button 
                  className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm py-1.5 sm:py-2 rounded transition ${
                    getButtonColor(match.status)
                  }`}
                  disabled={match.status === 'postponed' || match.status === 'cancelled'}
                >
                  {getButtonText(match.status, match.match_date)}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

