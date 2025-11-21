"use client"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'
import { Calendar, MapPin, Ticket, Clock, Filter } from 'lucide-react'
import Header from '@/components/nba-header'

interface Match {
  id: string
  match_date: string
  status: string
  home_score: number
  away_score: number
  round_number: number
  home_team?: {
    name: string
    logo_url: string
    home_city: string
    team_color: string
  }
  away_team?: {
    name: string
    logo_url: string
    home_city: string
    team_color: string
  }
  venue?: {
    name: string
    city: string
    capacity: number
  }
  division?: {
    name: string
  }
}

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('scheduled')

  useEffect(() => {
    loadSchedule()
  }, [statusFilter])

  const loadSchedule = async () => {
    const supabase = createClient()
    
    let query = supabase
      .from('matches')
      .select(`
        id,
        match_date,
        status,
        home_score,
        away_score,
        round_number,
        home_team:teams!matches_home_team_id_fkey(name, logo_url, home_city, team_color),
        away_team:teams!matches_away_team_id_fkey(name, logo_url, home_city, team_color),
        venue:venues(name, city, capacity),
        division:divisions(name)
      `)
      .order('match_date', { ascending: true })

    // Filter by status
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    // For scheduled matches, only show future games
    if (statusFilter === 'scheduled') {
      query = query.gte('match_date', new Date().toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading schedule:', error)
    } else if (data) {
      setMatches(data)
    }
    
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'live': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'postponed': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600 mt-1">View upcoming and past matches</p>
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
            {[
              { value: 'scheduled', label: 'Upcoming' },
              { value: 'live', label: 'Live' },
              { value: 'completed', label: 'Completed' },
              { value: 'all', label: 'All' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                  statusFilter === filter.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="p-8 bg-white rounded-xl border border-gray-200 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold mb-1">No matches found</p>
              <p className="text-gray-500 text-sm">
                {statusFilter === 'scheduled' && 'There are no upcoming matches scheduled.'}
                {statusFilter === 'live' && 'No matches are currently live.'}
                {statusFilter === 'completed' && 'No completed matches found.'}
                {statusFilter === 'all' && 'No matches in the system yet.'}
              </p>
            </div>
          ) : (
            matches.map((match) => {
              const dateInfo = formatDate(match.match_date)
              
              return (
                <div 
                  key={match.id} 
                  className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition"
                >
                  {/* Header - Date and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{dateInfo.fullDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{dateInfo.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {match.division && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {match.division.name}
                        </span>
                      )}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(match.status)}`}>
                        {match.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Matchup */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
                    {/* Away Team */}
                    <div className="flex items-center gap-4 flex-1 w-full sm:justify-end">
                      <div className="text-right flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {match.away_team?.name}
                        </h3>
                        {match.away_team?.home_city && (
                          <p className="text-sm text-gray-600">{match.away_team.home_city}</p>
                        )}
                      </div>
                      {match.away_team?.logo_url ? (
                        <img 
                          src={match.away_team.logo_url} 
                          className="w-16 h-16 object-contain" 
                          alt={match.away_team.name} 
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                          style={{ backgroundColor: match.away_team?.team_color || '#FF6B35' }}
                        >
                          {match.away_team?.name[0]}
                        </div>
                      )}
                    </div>

                    {/* Score/VS */}
                    <div className="flex items-center gap-4 px-6">
                      {match.status === 'completed' || match.status === 'live' ? (
                        <>
                          <span className="text-4xl font-bold text-gray-900">{match.home_score}</span>
                          <span className="text-gray-400 font-medium">-</span>
                          <span className="text-4xl font-bold text-gray-900">{match.away_score}</span>
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-400">VS</div>
                          <div className="text-xs text-gray-500 mt-1">Round {match.round_number}</div>
                        </div>
                      )}
                    </div>

                    {/* Home Team */}
                    <div className="flex items-center gap-4 flex-1 w-full sm:justify-start">
                      {match.home_team?.logo_url ? (
                        <img 
                          src={match.home_team.logo_url} 
                          className="w-16 h-16 object-contain" 
                          alt={match.home_team.name} 
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                          style={{ backgroundColor: match.home_team?.team_color || '#FF6B35' }}
                        >
                          {match.home_team?.name[0]}
                        </div>
                      )}
                      <div className="text-left flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {match.home_team?.name}
                        </h3>
                        {match.home_team?.home_city && (
                          <p className="text-sm text-gray-600">{match.home_team.home_city}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Venue */}
                  {match.venue && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 pt-4 border-t border-gray-100">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{match.venue.name}</span>
                      {match.venue.city && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>{match.venue.city}</span>
                        </>
                      )}
                      {match.venue.capacity && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>Capacity: {match.venue.capacity.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}