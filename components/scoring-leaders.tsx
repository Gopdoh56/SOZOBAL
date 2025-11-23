"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/Client'

interface ScoringLeader {
  id: string
  rank: number
  name: string
  team: string
  team_code: string
  ppg: string
  image_url: string
  is_active: boolean
}

export default function ScoringLeaders() {
  const [leaders, setLeaders] = useState<ScoringLeader[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {
    try {
      const supabase = createClient()
      console.log('🔍 Fetching scoring leaders...')

      const { data, error } = await supabase
        .from('scoring_leaders')
        .select('*')
        .eq('is_active', true)
        .order('rank', { ascending: true })

      console.log('📊 Query result:', { data, error })

      if (error) {
        console.error('❌ Supabase error:', error)
      } else if (data && data.length > 0) {
        console.log('✅ Found scoring leaders:', data)
        setLeaders(data)
      } else {
        console.log('⚠️ No active scoring leaders found')
      }
    } catch (err) {
      console.error('💥 Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-4xl font-bold">Scoring Leaders</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden animate-pulse h-64" />
      </section>
    )
  }

  if (leaders.length === 0) {
    return null // Or return fallback content
  }

  return (
    <section className="space-y-6">
      <h2 className="text-4xl font-bold">Scoring Leaders</h2>

      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <div className="space-y-0">
          {leaders.map((leader) => (
            <div
              key={leader.id}
              className="flex items-center justify-between px-6 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {leader.image_url ? (
                    <img 
                      src={leader.image_url} 
                      alt={leader.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-bold">{leader.rank}</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{leader.name}</div>
                  <div className="text-sm text-gray-600">{leader.team_code}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{leader.ppg}</div>
                <div className="text-xs text-gray-600">PPG</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}