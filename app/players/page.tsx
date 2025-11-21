"use client"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'
// 1. Import User icon for the dummy image
import { Search, Filter, User } from 'lucide-react'
import Header from '@/components/nba-header'

interface Player {
  id: string
  first_name: string
  last_name: string
  jersey_number: number
  position: string
  date_of_birth: string
  height_cm: number
  weight_kg: number
  team_id: string
  is_active: boolean
  image_url?: string // 2. Added optional image_url
  team?: {
    name: string
    logo_url: string
    team_color: string
  }
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPos, setFilterPos] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    const supabase = createClient()
    
    // 3. Included image_url in the select query
    const { data, error } = await supabase
      .from('players')
      .select('*, image_url, team:teams(name, logo_url, team_color)')
      .eq('is_active', true)
      .order('last_name')

    if (error) {
      console.error('Error loading players:', error)
    } else if (data) {
      setPlayers(data)
    }
    setLoading(false)
  }

  const filteredPlayers = players.filter((player) => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      player.team?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPosition = filterPos === 'all' || player.position === filterPos

    return matchesSearch && matchesPosition
  })

  const calculateAge = (dob: string) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatHeight = (cm: number) => {
    if (!cm) return 'N/A'
    const totalInches = cm / 2.54
    const feet = Math.floor(totalInches / 12)
    const inches = Math.round(totalInches % 12)
    return `${feet}'${inches}"`
  }

  const formatWeight = (kg: number) => {
    if (!kg) return 'N/A'
    const lbs = Math.round(kg * 2.20462)
    return `${lbs} lbs`
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
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Players</h1>
          <p className="text-gray-600">Browse all active players</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search players or teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'PG', 'SG', 'SF', 'PF', 'C', 'G', 'F'].map((pos) => (
              <button
                key={pos}
                onClick={() => setFilterPos(pos)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition whitespace-nowrap ${
                  filterPos === pos 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pos === 'all' ? 'All Players' : pos}
              </button>
            ))}
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((player) => (
            <div 
              key={player.id} 
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition group"
            >
              {/* 
                  UPDATED HEADER SECTION 
                  Logic: If image exists -> Show Image
                  Else -> Show Gray Background with User Icon (Dummy)
              */}
              <div className="h-48 relative flex items-end justify-center bg-gray-100 overflow-hidden">
                {player.image_url ? (
                  <img 
                    src={player.image_url} 
                    alt={`${player.first_name} ${player.last_name}`}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  // The Dummy Image
                  <User className="w-32 h-32 text-gray-300 translate-y-4" />
                )}

                {/* Overlays (Logo & Jersey Number) */}
                <div className="absolute top-3 right-3">
                  {player.team?.logo_url && (
                    <img 
                      src={player.team.logo_url} 
                      alt={player.team.name} 
                      className="w-10 h-10 rounded-lg bg-white/90 p-1 shadow-sm" 
                    />
                  )}
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg font-bold text-sm shadow-sm border border-gray-100">
                  #{player.jersey_number}
                </div>
                
                {/* Optional: Bottom gradient to make text below clearer */}
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/5 to-transparent" />
              </div>

              {/* Player Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">
                    {player.first_name} {player.last_name}
                  </h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-medium text-orange-600">
                      {player.position || 'N/A'}
                    </span>
                    {player.team && (
                      <span className="text-xs text-gray-600">
                        {player.team.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Height</p>
                    <p className="font-semibold text-gray-900">
                      {formatHeight(player.height_cm)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Weight</p>
                    <p className="font-semibold text-gray-900">
                      {formatWeight(player.weight_kg)}
                    </p>
                  </div>
                  {player.date_of_birth && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Age</p>
                      <p className="font-semibold text-gray-900">
                        {calculateAge(player.date_of_birth)} years
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No players found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}