"use client"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
// 1. Import your Header component here
// (Adjust the path if your Header is in a different folder)
import Header from '@/components/nba-header' 

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  match_date: string
  home_score: number
  away_score: number
  status: string
  attendance: number
  home_team?: { name: string; logo_url: string }
  away_team?: { name: string; logo_url: string }
  venue?: { name: string }
}

export default function GamesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadMatches()
  }, [filter])

  const loadMatches = async () => {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url),
        venue:venues(name)
      `)
      .order('match_date', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (data) {
      setMatches(data)
    } else if (error) {
      console.error('Error loading matches:', error)
    }
    
    setLoading(false)
  }

  // Updated to use text-black for better contrast while keeping colored backgrounds
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-black border border-red-200'
      case 'completed': return 'bg-gray-100 text-black border border-gray-200'
      case 'scheduled': return 'bg-blue-100 text-black border border-blue-200'
      case 'postponed': return 'bg-yellow-100 text-black border border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-black border border-red-200'
      default: return 'bg-gray-100 text-black'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-black">Games</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 2. Header added at the top */}
      <Header />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Changed Title to text-black */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-black">Games</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'live', 'completed', 'scheduled', 'postponed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              // Changed text-gray-700 to text-black
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                filter === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {matches.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
              {/* Changed text-gray-500 to text-black */}
              <p className="text-black font-medium">No games found</p>
            </div>
          ) : (
            matches.map((match) => {
              const matchDate = new Date(match.match_date)
              
              return (
                <div key={match.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(match.status)}`}>
                      {match.status.toUpperCase()}
                    </span>
                    {/* Changed text-gray-600 to text-black */}
                    <div className="flex items-center gap-4 text-sm text-black font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="space-y-2 mb-4">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {match.home_team?.logo_url ? (
                          <img src={match.home_team.logo_url} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center">
                            <span className="text-orange-600 font-bold">{match.home_team?.name?.[0]}</span>
                          </div>
                        )}
                        {/* Added text-black */}
                        <span className="font-bold text-black">{match.home_team?.name || 'TBD'}</span>
                      </div>
                      <span className={`text-2xl font-bold ${
                        match.status === 'completed' && match.home_score > match.away_score 
                        ? 'text-orange-600' 
                        : 'text-black' // Changed default score color to black
                      }`}>
                        {match.home_score || 0}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {match.away_team?.logo_url ? (
                          <img src={match.away_team.logo_url} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center">
                            <span className="text-orange-600 font-bold">{match.away_team?.name?.[0]}</span>
                          </div>
                        )}
                        {/* Added text-black */}
                        <span className="font-bold text-black">{match.away_team?.name || 'TBD'}</span>
                      </div>
                      <span className={`text-2xl font-bold ${
                        match.status === 'completed' && match.away_score > match.home_score 
                        ? 'text-orange-600' 
                        : 'text-black' // Changed default score color to black
                      }`}>
                        {match.away_score || 0}
                      </span>
                    </div>
                  </div>

                  {/* Footer Info */}
                  {/* Changed text-gray-600 to text-black */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-black font-medium">
                    {match.venue?.name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{match.venue.name}</span>
                      </div>
                    )}
                    {match.attendance > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{match.attendance.toLocaleString()}</span>
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