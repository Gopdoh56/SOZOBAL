"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/Client'

interface FeaturedPlayer {
  id: string
  name: string
  position: string
  jersey_number: string
  team: string
  image_url: string
  ppg: string
  rpg: string
  apg: string
  is_active: boolean
  created_at: string
}

export default function FeaturedPlayer() {
  const [player, setPlayer] = useState<FeaturedPlayer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlayer()
  }, [])

  const loadPlayer = async () => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('featured_player')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Supabase error:', error)
      } else if (data && data.length > 0) {
        setPlayer(data[0])
      } else {
        console.log('No active featured player found')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-4xl font-bold">Featured Player</h2>
        <div className="bg-gradient-to-br from-gray-800 to-black rounded-lg overflow-hidden animate-pulse h-96" />
      </section>
    )
  }

  if (!player) {
    return null
  }

  return (
    <section className="space-y-6">
      <h2 className="text-4xl font-bold">Featured Player</h2>

      <div className="bg-gradient-to-br from-gray-800 to-black rounded-lg overflow-hidden">
        <div className="aspect-square bg-gray-800 flex items-center justify-center">
          {player.image_url ? (
            <img 
              src={player.image_url} 
              alt={player.name} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span className="text-gray-500">No image</span>
          )}
        </div>

        <div className="p-8 text-white">
          <div className="bg-red-700 inline-block px-4 py-2 rounded mb-4">
            <span className="text-sm font-bold">PLAYER OF THE WEEK</span>
          </div>

          <h3 className="text-4xl font-bold mb-2">{player.name}</h3>
          <p className="text-gray-400 mb-6">
            {player.position} • #{player.jersey_number} • {player.team}
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold text-white">{player.ppg || '0.0'}</div>
              <div className="text-sm text-gray-400">PPG</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{player.rpg || '0.0'}</div>
              <div className="text-sm text-gray-400">RPG</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{player.apg || '0.0'}</div>
              <div className="text-sm text-gray-400">APG</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}