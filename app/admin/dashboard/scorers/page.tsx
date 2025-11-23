"use client"

import { useState, useEffect } from 'react'
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
  created_at: string
}

export default function ScoringLeadersAdmin() {
  const [leaders, setLeaders] = useState<ScoringLeader[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [rank, setRank] = useState('')
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [teamCode, setTeamCode] = useState('')
  const [ppg, setPpg] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadLeaders()
  }, [])

  const loadLeaders = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('scoring_leaders')
      .select('*')
      .order('rank', { ascending: true })

    if (error) {
      console.error('Error loading leaders:', error)
      alert('Error loading leaders: ' + error.message)
    } else if (data) {
      setLeaders(data)
    }
    
    setLoading(false)
  }

  const handleSave = async () => {
    if (!rank.trim() || !name.trim() || !team.trim() || !teamCode.trim() || !ppg.trim()) {
      alert('Please fill in all required fields (Rank, Player Name, Team Name, Team Code, and PPG)')
      return
    }

    const supabase = createClient()

    if (editingId) {
      // Update existing leader
      const { error } = await supabase
        .from('scoring_leaders')
        .update({
          rank: parseInt(rank),
          name,
          team,
          team_code: teamCode,
          ppg,
          image_url: imageUrl
        })
        .eq('id', editingId)

      if (error) {
        console.error('Error updating leader:', error)
        alert('Error updating leader: ' + error.message)
      } else {
        alert('Leader updated successfully!')
        resetForm()
        loadLeaders()
      }
    } else {
      // Insert new leader
      const { error } = await supabase
        .from('scoring_leaders')
        .insert({
          rank: parseInt(rank),
          name,
          team,
          team_code: teamCode,
          ppg,
          image_url: imageUrl,
          is_active: true
        })

      if (error) {
        console.error('Error creating leader:', error)
        alert('Error creating leader: ' + error.message)
      } else {
        alert('Leader created successfully!')
        resetForm()
        loadLeaders()
      }
    }
  }

  const resetForm = () => {
    setRank('')
    setName('')
    setTeam('')
    setTeamCode('')
    setPpg('')
    setImageUrl('')
    setEditingId(null)
  }

  const handleEdit = (leader: ScoringLeader) => {
    setRank(leader.rank.toString())
    setName(leader.name)
    setTeam(leader.team)
    setTeamCode(leader.team_code)
    setPpg(leader.ppg)
    setImageUrl(leader.image_url)
    setEditingId(leader.id)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('scoring_leaders')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error toggling leader:', error)
      alert('Error toggling leader status: ' + error.message)
    } else {
      alert(`Leader ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
      loadLeaders()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leader?')) return
    
    const supabase = createClient()
    
    const { error } = await supabase
      .from('scoring_leaders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting leader:', error)
      alert('Error deleting leader: ' + error.message)
    } else {
      alert('Leader deleted successfully!')
      loadLeaders()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-black mb-6">Scoring Leaders Admin</h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4">
            {editingId ? 'Edit Leader' : 'Add New Leader'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-black mb-2">Rank *</label>
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="1"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Player Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="Jayson Tatum"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Team Name *</label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="Boston Celtics"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Team Code *</label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="BOS"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">PPG (Points Per Game) *</label>
              <input
                type="text"
                value={ppg}
                onChange={(e) => setPpg(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="30.8"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="/player-image.png"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-red-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-800 transition"
            >
              {editingId ? 'Update' : 'Add'} Leader
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-200 text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Leaders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-xl font-bold text-black">Existing Leaders</h2>
          </div>
          <div className="divide-y divide-gray-300">
            {leaders.length === 0 ? (
              <div className="p-6 text-center text-black">
                No leaders yet. Add your first leader above!
              </div>
            ) : (
              leaders.map((leader) => (
                <div key={leader.id} className="p-6">
                  <div className="flex gap-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-red-700 text-white rounded-full font-bold text-2xl">
                      {leader.rank}
                    </div>
                    {leader.image_url && (
                      <img
                        src={leader.image_url}
                        alt={leader.name}
                        className="w-16 h-16 object-cover rounded-full border border-gray-300"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-black font-bold text-xl">{leader.name}</h3>
                      <p className="text-black font-medium">
                        {leader.team} ({leader.team_code})
                      </p>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-red-700">{leader.ppg} PPG</span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            leader.is_active
                              ? 'bg-green-100 text-black border border-green-300'
                              : 'bg-gray-100 text-black border border-gray-300'
                          }`}
                        >
                          {leader.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleToggle(leader.id, leader.is_active)}
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleEdit(leader)}
                        className="text-black hover:text-gray-700 font-bold text-sm underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(leader.id)}
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preview */}
        {leaders.length > 0 && leaders.filter(l => l.is_active).length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-black mb-4">Active Leaders Preview</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <div className="space-y-0">
                {leaders
                  .filter(l => l.is_active)
                  .map((leader) => (
                    <div
                      key={leader.id}
                      className="flex items-center justify-between px-6 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          {leader.image_url ? (
                            <img 
                              src={leader.image_url} 
                              alt={leader.name}
                              className="w-full h-full rounded-full object-cover"
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
          </div>
        )}
      </div>
    </div>
  )
}