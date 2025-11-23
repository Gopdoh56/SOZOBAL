"use client"

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'
import { useRouter } from 'next/navigation'

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  home_score: number
  away_score: number
  status: string
  match_type: string
  league_name: string
  tournament_name: string
  custom_category: string
  home_team?: { name: string; logo_url: string }
  away_team?: { name: string; logo_url: string }
}

export default function ScoresSection() {
  const [activeWeek, setActiveWeek] = useState(0)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
      .limit(3)

    if (data) {
      setMatches(data)
    } else if (error) {
      console.error('Error loading matches:', error)
    }
    
    setLoading(false)
  }

  // TIMEZONE-SAFE DATE PARSING (same as Matches page)
  const parseMatchDate = (dateString: string) => {
    if (!dateString) return null
    
    const [datePart, timePart] = dateString.split('T')
    if (!datePart) return null
    
    const [year, month, day] = datePart.split('-')
    
    // Create date without timezone conversion
    return {
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      datePart,
      timePart: timePart || ''
    }
  }

  const formatMatchDateTime = (dateString: string) => {
    const parsed = parseMatchDate(dateString)
    if (!parsed) return { dayOfWeek: '', dateStr: '', timeStr: '' }
    
    const date = new Date(parsed.year, parsed.month - 1, parsed.day)
    
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    let timeStr = ''
    if (parsed.timePart) {
      const [hours, minutes] = parsed.timePart.split(':')
      const hour = parseInt(hours)
      const min = minutes || '00'
      
      const period = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      timeStr = `${hour12}:${min} ${period}`
    }
    
    return { dayOfWeek, dateStr, timeStr }
  }

  const getMatchCategory = (match: Match) => {
    switch (match.match_type) {
      case 'friendly':
        return 'Friendly Match'
      case 'league':
        return match.league_name || 'League Game'
      case 'tournament':
        return match.tournament_name || 'Tournament'
      case 'custom':
        return match.custom_category || 'Custom Match'
      default:
        return 'Match'
    }
  }

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'friendly': 
        return 'bg-blue-100 text-blue-700'
      case 'league': 
        return 'bg-purple-100 text-purple-700'
      case 'tournament': 
        return 'bg-amber-100 text-amber-700'
      case 'custom': 
        return 'bg-teal-100 text-teal-700'
      default: 
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusDisplay = (status: string, matchDate: string) => {
    if (status === 'completed') return 'FINAL'
    if (status === 'live') return 'LIVE'
    if (status === 'postponed') return 'POSTPONED'
    if (status === 'cancelled') return 'CANCELLED'
    
    // For scheduled matches, show time
    const { timeStr } = formatMatchDateTime(matchDate)
    if (timeStr) {
      return timeStr
    }
    
    return 'SCHEDULED'
  }

  const getButtonText = (status: string, matchDate: string) => {
    if (status === 'live') return '▶ WATCH LIVE'
    if (status === 'completed') return 'VIEW BOX SCORE'
    if (status === 'postponed') return 'POSTPONED'
    if (status === 'cancelled') return 'CANCELLED'
    
    // For scheduled matches
    const { timeStr } = formatMatchDateTime(matchDate)
    if (timeStr) {
      return `▶ GAME STARTS ${timeStr}`
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
    if (!teamName) return 'TBD'
    
    const words = teamName.split(' ')
    if (words.length > 1) {
      return words.map(w => w[0]).join('').toUpperCase().slice(0, 3)
    }
    return teamName.slice(0, 3).toUpperCase()
  }

  const handleCardClick = (match: Match) => {
    router.push(`/game_stats?id=${match.id}`)
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
            const { dayOfWeek, dateStr } = formatMatchDateTime(match.match_date)
            
            return (
              <div 
                key={match.id} 
                onClick={() => handleCardClick(match)}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-orange-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                      match.status === 'live' ? 'bg-red-100 text-red-700' :
                      match.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getStatusDisplay(match.status, match.match_date)}
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${getMatchTypeColor(match.match_type)}`}>
                      {getMatchCategory(match)}
                    </div>
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

                <div 
                  className={`w-full flex items-center justify-center gap-2 font-semibold py-2 text-sm rounded-lg transition ${
                    getButtonColor(match.status)
                  }`}
                >
                  {getButtonText(match.status, match.match_date)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}