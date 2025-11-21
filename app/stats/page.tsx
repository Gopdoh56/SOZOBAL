"use client"
import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/Client'
import { Trophy, Activity, Target } from 'lucide-react'
import Header from '@/components/nba-header'

interface Player {
  id: string
  first_name: string
  last_name: string
  jersey_number: number
  team_id: string
  team?: {
    name: string
    logo_url: string
    home_city: string
  }
}

interface PlayerMatchStats {
  player_id: string
  points: number
  assists: number
  rebounds: number
  steals: number
  blocks: number
  minutes_played: number
}

interface StatLeader {
  player_id: string
  player_name: string
  jersey_number: number
  team_name: string
  team_logo: string
  team_city: string
  value: number
  games_played: number
}

export default function StatsPage() {
  const [stats, setStats] = useState<{
    points: StatLeader[]
    assists: StatLeader[]
    rebounds: StatLeader[]
    steals: StatLeader[]
    blocks: StatLeader[]
  }>({
    points: [],
    assists: [],
    rebounds: [],
    steals: [],
    blocks: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const supabase = createClient()
    
    // Fetch all players with their teams
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select(`
        id,
        first_name,
        last_name,
        jersey_number,
        team_id,
        team:teams(name, logo_url, home_city)
      `)
      .eq('is_active', true)

    if (playersError) {
      console.error('Error loading players:', playersError)
      setLoading(false)
      return
    }

    // Fetch all player match stats
    const { data: matchStats, error: statsError } = await supabase
      .from('player_match_stats')
      .select('player_id, points, assists, rebounds, steals, blocks, minutes_played')

    if (statsError) {
      console.error('Error loading stats:', statsError)
      setLoading(false)
      return
    }

    if (players && matchStats) {
      // Aggregate stats per player
      const playerStatsMap = new Map<string, {
        totalPoints: number
        totalAssists: number
        totalRebounds: number
        totalSteals: number
        totalBlocks: number
        gamesPlayed: number
      }>()

      matchStats.forEach((stat) => {
        if (!playerStatsMap.has(stat.player_id)) {
          playerStatsMap.set(stat.player_id, {
            totalPoints: 0,
            totalAssists: 0,
            totalRebounds: 0,
            totalSteals: 0,
            totalBlocks: 0,
            gamesPlayed: 0
          })
        }
        
        const playerStat = playerStatsMap.get(stat.player_id)!
        playerStat.totalPoints += stat.points || 0
        playerStat.totalAssists += stat.assists || 0
        playerStat.totalRebounds += stat.rebounds || 0
        playerStat.totalSteals += stat.steals || 0
        playerStat.totalBlocks += stat.blocks || 0
        playerStat.gamesPlayed += 1
      })

      // Create stat leaders array
      const statLeaders: StatLeader[] = players
        .filter(player => playerStatsMap.has(player.id))
        .map(player => {
          const stats = playerStatsMap.get(player.id)!
          return {
            player_id: player.id,
            player_name: `${player.first_name} ${player.last_name}`,
            jersey_number: player.jersey_number,
            team_name: player.team?.name || 'No Team',
            team_logo: player.team?.logo_url || '',
            team_city: player.team?.home_city || '',
            ppg: stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0,
            apg: stats.gamesPlayed > 0 ? stats.totalAssists / stats.gamesPlayed : 0,
            rpg: stats.gamesPlayed > 0 ? stats.totalRebounds / stats.gamesPlayed : 0,
            spg: stats.gamesPlayed > 0 ? stats.totalSteals / stats.gamesPlayed : 0,
            bpg: stats.gamesPlayed > 0 ? stats.totalBlocks / stats.gamesPlayed : 0,
            games_played: stats.gamesPlayed,
            value: 0 // Will be set based on category
          }
        })
        .filter(leader => leader.games_played >= 3) // Minimum 3 games played

      // Sort and get top 10 for each category
      setStats({
        points: [...statLeaders]
          .map(l => ({ ...l, value: l.ppg }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
        assists: [...statLeaders]
          .map(l => ({ ...l, value: l.apg }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
        rebounds: [...statLeaders]
          .map(l => ({ ...l, value: l.rpg }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
        steals: [...statLeaders]
          .map(l => ({ ...l, value: l.spg }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
        blocks: [...statLeaders]
          .map(l => ({ ...l, value: l.bpg }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
      })
    }
    
    setLoading(false)
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">League Leaders</h1>
          <p className="text-gray-600 mt-1">Top performers across key statistics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Points Column */}
          <LeaderCard 
            title="Points Per Game" 
            icon={<Trophy className="w-5 h-5 text-orange-600" />} 
            data={stats.points} 
            format="PPG"
            color="orange"
          />
          
          {/* Assists Column */}
          <LeaderCard 
            title="Assists Per Game" 
            icon={<Target className="w-5 h-5 text-blue-600" />} 
            data={stats.assists} 
            format="APG"
            color="blue"
          />
          
          {/* Rebounds Column */}
          <LeaderCard 
            title="Rebounds Per Game" 
            icon={<Activity className="w-5 h-5 text-green-600" />} 
            data={stats.rebounds} 
            format="RPG"
            color="green"
          />

          {/* Steals Column */}
          <LeaderCard 
            title="Steals Per Game" 
            icon={<Trophy className="w-5 h-5 text-purple-600" />} 
            data={stats.steals} 
            format="SPG"
            color="purple"
          />

          {/* Blocks Column */}
          <LeaderCard 
            title="Blocks Per Game" 
            icon={<Activity className="w-5 h-5 text-red-600" />} 
            data={stats.blocks} 
            format="BPG"
            color="red"
          />
        </div>

        {stats.points.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No statistics available yet</p>
            <p className="text-sm text-gray-400 mt-2">Stats will appear once matches are completed</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable Component for Leader Tables
const LeaderCard = ({ 
  title, 
  icon, 
  data, 
  format,
  color 
}: { 
  title: string
  icon: any
  data: StatLeader[]
  format: string
  color: string
}) => {
  const colorClasses = {
    orange: 'text-orange-600 bg-orange-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className={`p-4 border-b border-gray-100 flex items-center gap-2 ${colorClasses[color as keyof typeof colorClasses]?.replace('text-', 'bg-').replace('600', '50') || 'bg-gray-50'}`}>
        {icon}
        <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
      </div>
      
      <div className="divide-y divide-gray-100">
        {data.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No data available
          </div>
        ) : (
          data.map((player, index) => (
            <div key={player.player_id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
              <div className={`font-bold text-lg w-8 text-center ${
                index === 0 ? colorClasses[color as keyof typeof colorClasses]?.split(' ')[0] || 'text-gray-900' : 'text-gray-600'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  colorClasses[color as keyof typeof colorClasses]?.split(' ')[0].replace('text-', 'bg-') || 'bg-gray-400'
                }`}>
                  #{player.jersey_number}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{player.player_name}</h3>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium text-gray-600 truncate">{player.team_name}</p>
                    {player.team_logo && (
                      <img src={player.team_logo} className="w-4 h-4 object-contain flex-shrink-0" alt="" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{player.games_played} games</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="block text-2xl font-black text-gray-900">{player.value.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{format}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}



