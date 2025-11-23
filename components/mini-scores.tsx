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
  home_team?: { name: string; logo_url: string }
  away_team?: { name: string; logo_url: string }
}

export default function MiniScores() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(0)
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

  const formatMatchDateTime = (dateString: string) => {
    if (!dateString) return { date: '', time: '' };
    
    const [datePart, timePart] = dateString.split('T');
    
    let date = '';
    let time = '';
    
    if (datePart) {
      const [year, month, day] = datePart.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      date = dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      }).toUpperCase();
    }
    
    if (timePart) {
      const [hours, minutes] = timePart.split(':');
      const hour = parseInt(hours);
      const min = minutes || '00';
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      time = `${hour12}:${min} ${period}`;
    }
    
    return { date, time };
  };

  const getStatusDisplay = (status: string, matchDate: string) => {
    if (status === 'completed') return 'FINAL'
    if (status === 'live') return 'LIVE'
    if (status === 'postponed') return 'POSTPONED'
    if (status === 'cancelled') return 'CANCELLED'
    
    const { date, time } = formatMatchDateTime(matchDate);
    return time ? `${date} • ${time}` : date || 'SCHEDULED'
  }

  const getButtonText = (status: string, matchDate: string) => {
    if (status === 'live') return '▶ LIVE'
    if (status === 'completed') return 'BOX SCORE'
    if (status === 'postponed') return 'POSTPONED'
    if (status === 'cancelled') return 'CANCELLED'
    
    return '▶ SCHEDULED'
  }

  const getButtonColor = (status: string) => {
    if (status === 'live') return 'text-red-600 bg-red-50 hover:bg-red-100'
    if (status === 'completed') return 'text-gray-600 hover:bg-gray-100'
    if (status === 'postponed' || status === 'cancelled') return 'text-gray-400 cursor-not-allowed'
    return 'text-yellow-500 hover:bg-yellow-50'
  }

  const handleCardClick = (match: Match) => {
    router.push(`/game_stats?id=${match.id}`)
  }

  const handlePrevWeek = () => setActiveWeek(activeWeek - 1)
  const handleNextWeek = () => setActiveWeek(activeWeek + 1)

  if (loading) {
    return (
      <section className="bg-gray-100 px-1.5 py-2.5 sm:px-3 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
        </div>
      </section>
    )
  }

  const { startOfWeek, endOfWeek } = getWeekDates(activeWeek)

  return (
    <section className="bg-gray-100 px-1.5 py-2.5 sm:px-3 sm:py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5">
          {/* Date Sidebar */}
          <div className="flex flex-col items-center justify-between bg-white rounded-lg p-1.5 min-w-12 sm:min-w-14 text-center border border-gray-200 flex-shrink-0">
            <button 
              onClick={handlePrevWeek}
              className="text-gray-400 hover:text-gray-600 text-[10px]"
            >
              ▲
            </button>
            <span className="text-[9px] sm:text-[10px] font-semibold text-gray-600 whitespace-pre-line leading-tight">
              {startOfWeek.getDate()}
              <br />
              {startOfWeek.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              <br />
              -
              <br />
              {endOfWeek.getDate()}
              <br />
              {endOfWeek.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
            </span>
            <button 
              onClick={handleNextWeek}
              className="text-gray-400 hover:text-gray-600 text-[10px]"
            >
              ▼
            </button>
          </div>

          {/* Game Cards */}
          {matches.length === 0 ? (
            <div className="bg-white rounded-lg p-4 border border-gray-200 min-w-44 flex items-center justify-center">
              <p className="text-gray-500 text-xs">No matches this week</p>
            </div>
          ) : (
            matches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => handleCardClick(match)}
                className="bg-white rounded-lg p-2 border border-gray-200 min-w-44 sm:min-w-48 flex-shrink-0 transition cursor-pointer hover:shadow-md hover:border-orange-300"
              >
                <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-1.5">
                  {getStatusDisplay(match.status, match.match_date)}
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {match.home_team?.logo_url ? (
                      <img 
                        src={match.home_team.logo_url} 
                        alt={match.home_team.name}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-[9px]">
                          {match.home_team?.name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    <span className="font-semibold text-[11px] sm:text-xs">
                      {match.home_team?.name || 'TBD'}
                    </span>
                  </div>
                  <span className={`text-base sm:text-lg font-bold ${
                    match.status === 'completed' && match.home_score > match.away_score 
                      ? 'text-orange-600' 
                      : 'text-gray-900'
                  }`}>
                    {match.home_score || 0}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {match.away_team?.logo_url ? (
                      <img 
                        src={match.away_team.logo_url} 
                        alt={match.away_team.name}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover"
                      />
                    ) : (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-[9px]">
                          {match.away_team?.name?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    <span className="font-semibold text-[11px] sm:text-xs">
                      {match.away_team?.name || 'TBD'}
                    </span>
                  </div>
                  <span className={`text-base sm:text-lg font-bold ${
                    match.status === 'completed' && match.away_score > match.home_score 
                      ? 'text-orange-600' 
                      : 'text-gray-900'
                  }`}>
                    {match.away_score || 0}
                  </span>
                </div>

                {/* Action Button */}
                <div 
                  className={`w-full flex items-center justify-center gap-1 sm:gap-1.5 font-semibold text-[10px] sm:text-xs py-1 sm:py-1.5 rounded transition ${
                    getButtonColor(match.status)
                  }`}
                >
                  {getButtonText(match.status, match.match_date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}