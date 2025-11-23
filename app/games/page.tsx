"use client"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react'
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

const ITEMS_PER_PAGE = 10

export default function GamesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  useEffect(() => {
    loadMatches()
  }, [filter])

  useEffect(() => {
    setCurrentPage(1) // Reset to page 1 when filter changes
  }, [filter])

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    
    const startOfWeek = new Date(today)
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay
    startOfWeek.setDate(today.getDate() + daysToMonday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    
    return { startOfWeek, endOfWeek, today }
  }

  const sortMatchesByProximity = (matches: Match[]) => {
    const { startOfWeek, endOfWeek, today } = getWeekDates()
    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    // Categorize matches
    const todayMatches: Match[] = []
    const thisWeekMatches: Match[] = []
    const otherMatches: Match[] = []

    matches.forEach(match => {
      const matchDate = new Date(match.match_date)
      
      if (matchDate >= todayStart && matchDate <= todayEnd) {
        todayMatches.push(match)
      } else if (matchDate >= startOfWeek && matchDate <= endOfWeek) {
        thisWeekMatches.push(match)
      } else {
        otherMatches.push(match)
      }
    })

    // Sort each category by date (most recent first)
    todayMatches.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    thisWeekMatches.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    otherMatches.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())

    return [...todayMatches, ...thisWeekMatches, ...otherMatches]
  }

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

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error } = await query

    if (data) {
      const sortedMatches = sortMatchesByProximity(data)
      setMatches(sortedMatches)
    } else if (error) {
      console.error('Error loading matches:', error)
    }
    
    setLoading(false)
  }

  const handleCardClick = (matchId: string) => {
    router.push(`/game_stats?id=${matchId}`)
  }

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

  const isToday = (dateString: string) => {
    const matchDate = new Date(dateString)
    const today = new Date()
    return matchDate.toDateString() === today.toDateString()
  }

  const isThisWeek = (dateString: string) => {
    const { startOfWeek, endOfWeek } = getWeekDates()
    const matchDate = new Date(dateString)
    return matchDate >= startOfWeek && matchDate <= endOfWeek
  }

  // Pagination logic
  const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentMatches = matches.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      <Header />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-black">Games</h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'live', 'completed', 'scheduled', 'postponed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
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
          {currentMatches.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-black font-medium">No games found</p>
            </div>
          ) : (
            currentMatches.map((match) => {
              const matchDate = new Date(match.match_date)
              const showTodayBadge = isToday(match.match_date)
              const showThisWeekBadge = !showTodayBadge && isThisWeek(match.match_date)
              
              return (
                <div 
                  key={match.id} 
                  onClick={() => handleCardClick(match.id)}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md hover:border-orange-300 transition cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(match.status)}`}>
                        {match.status.toUpperCase()}
                      </span>
                      {showTodayBadge && (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                          TODAY
                        </span>
                      )}
                      {showThisWeekBadge && (
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600 border border-blue-200">
                          THIS WEEK
                        </span>
                      )}
                    </div>
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
                        <span className="font-bold text-black">{match.home_team?.name || 'TBD'}</span>
                      </div>
                      <span className={`text-2xl font-bold ${
                        match.status === 'completed' && match.home_score > match.away_score 
                        ? 'text-orange-600' 
                        : 'text-black'
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
                        <span className="font-bold text-black">{match.away_team?.name || 'TBD'}</span>
                      </div>
                      <span className={`text-2xl font-bold ${
                        match.status === 'completed' && match.away_score > match.home_score 
                        ? 'text-orange-600' 
                        : 'text-black'
                      }`}>
                        {match.away_score || 0}
                      </span>
                    </div>
                  </div>

                  {/* Footer Info */}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border transition ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-black hover:bg-gray-50 border-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-black hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  )
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-black">
                      ...
                    </span>
                  )
                }
                return null
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border transition ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : 'bg-white text-black hover:bg-gray-50 border-gray-200'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Page Info */}
        {matches.length > 0 && (
          <div className="mt-4 text-center text-sm text-black">
            Showing {startIndex + 1} - {Math.min(endIndex, matches.length)} of {matches.length} games
          </div>
        )}
      </div>
    </div>
  )
}