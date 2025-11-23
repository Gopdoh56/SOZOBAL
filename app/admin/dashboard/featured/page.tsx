"use client"

import { useState, useEffect } from 'react'
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

export default function FeaturedPlayerAdmin() {
  const [players, setPlayers] = useState<FeaturedPlayer[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [team, setTeam] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [ppg, setPpg] = useState('')
  const [rpg, setRpg] = useState('')
  const [apg, setApg] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('featured_player')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading players:', error)
      alert('Error loading players: ' + error.message)
    } else if (data) {
      setPlayers(data)
    }
    
    setLoading(false)
  }

  const handleSave = async () => {
    if (!name.trim() || !position.trim() || !jerseyNumber.trim() || !team.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const supabase = createClient()

    if (editingId) {
      // Update existing player
      const { error } = await supabase
        .from('featured_player')
        .update({
          name,
          position,
          jersey_number: jerseyNumber,
          team,
          image_url: imageUrl,
          ppg,
          rpg,
          apg
        })
        .eq('id', editingId)

      if (error) {
        console.error('Error updating player:', error)
        alert('Error updating player: ' + error.message)
      } else {
        alert('Player updated successfully!')
        resetForm()
        loadPlayers()
      }
    } else {
      // Insert new player
      const { error } = await supabase
        .from('featured_player')
        .insert({
          name,
          position,
          jersey_number: jerseyNumber,
          team,
          image_url: imageUrl,
          ppg,
          rpg,
          apg,
          is_active: false // New players start as inactive by default
        })

      if (error) {
        console.error('Error creating player:', error)
        alert('Error creating player: ' + error.message)
      } else {
        alert('Player created successfully! Click "Toggle" to activate.')
        resetForm()
        loadPlayers()
      }
    }
  }

  const resetForm = () => {
    setName('')
    setPosition('')
    setJerseyNumber('')
    setTeam('')
    setImageUrl('')
    setPpg('')
    setRpg('')
    setApg('')
    setEditingId(null)
  }

  const handleEdit = (player: FeaturedPlayer) => {
    setName(player.name)
    setPosition(player.position)
    setJerseyNumber(player.jersey_number)
    setTeam(player.team)
    setImageUrl(player.image_url)
    setPpg(player.ppg)
    setRpg(player.rpg)
    setApg(player.apg)
    setEditingId(player.id)
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('featured_player')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error toggling player:', error)
      alert('Error toggling player status: ' + error.message)
    } else {
      alert(`Player ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
      loadPlayers()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return
    
    const supabase = createClient()
    
    const { error } = await supabase
      .from('featured_player')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting player:', error)
      alert('Error deleting player: ' + error.message)
    } else {
      alert('Player deleted successfully!')
      loadPlayers()
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
        <h1 className="text-3xl font-bold text-black mb-6">Featured Player Admin</h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-black mb-4">
            {editingId ? 'Edit Player' : 'Add New Player'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
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
              <label className="block text-sm font-bold text-black mb-2">Position *</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="Forward"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Jersey Number *</label>
              <input
                type="text"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">Team *</label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                placeholder="Boston Celtics"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-black mb-2">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
              placeholder="/basketball-player-red-jersey.png"
            />
          </div>

          <div className="border-t border-gray-300 pt-4 mb-4">
            <h3 className="text-lg font-bold text-black mb-3">Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">PPG</label>
                <input
                  type="text"
                  value={ppg}
                  onChange={(e) => setPpg(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                  placeholder="30.8"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">RPG</label>
                <input
                  type="text"
                  value={rpg}
                  onChange={(e) => setRpg(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                  placeholder="8.9"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">APG</label>
                <input
                  type="text"
                  value={apg}
                  onChange={(e) => setApg(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-black"
                  placeholder="4.6"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="bg-red-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-800 transition"
            >
              {editingId ? 'Update' : 'Add'} Player
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

        {/* Players List */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-xl font-bold text-black">Existing Players</h2>
          </div>
          <div className="divide-y divide-gray-300">
            {players.length === 0 ? (
              <div className="p-6 text-center text-black">
                No players yet. Add your first player above!
              </div>
            ) : (
              players.map((player) => (
                <div key={player.id} className="p-6">
                  <div className="flex gap-4">
                    {player.image_url && (
                      <img
                        src={player.image_url}
                        alt={player.name}
                        className="w-24 h-24 object-cover rounded border border-gray-300"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-black font-bold text-xl">{player.name}</h3>
                      <p className="text-black font-medium">
                        {player.position} • #{player.jersey_number} • {player.team}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm text-black"><strong>PPG:</strong> {player.ppg || 'N/A'}</span>
                        <span className="text-sm text-black"><strong>RPG:</strong> {player.rpg || 'N/A'}</span>
                        <span className="text-sm text-black"><strong>APG:</strong> {player.apg || 'N/A'}</span>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            player.is_active
                              ? 'bg-green-100 text-black border border-green-300'
                              : 'bg-gray-100 text-black border border-gray-300'
                          }`}
                        >
                          {player.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleToggle(player.id, player.is_active)}
                        className="text-red-600 hover:text-red-800 font-bold text-sm"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleEdit(player)}
                        className="text-black hover:text-gray-700 font-bold text-sm underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(player.id)}
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
        {players.length > 0 && players.find(p => p.is_active) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-black mb-4">Active Player Preview</h2>
            {(() => {
              const activePlayer = players.find(p => p.is_active)!
              return (
                <div className="bg-gradient-to-br from-gray-800 to-black rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-800 flex items-center justify-center">
                    {activePlayer.image_url ? (
                      <img src={activePlayer.image_url} alt={activePlayer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-500">No image</span>
                    )}
                  </div>

                  <div className="p-8 text-white">
                    <div className="bg-red-700 inline-block px-4 py-2 rounded mb-4">
                      <span className="text-sm font-bold">PLAYER OF THE WEEK</span>
                    </div>

                    <h3 className="text-4xl font-bold mb-2">{activePlayer.name}</h3>
                    <p className="text-gray-400 mb-6">
                      {activePlayer.position} • #{activePlayer.jersey_number} • {activePlayer.team}
                    </p>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-3xl font-bold text-white">{activePlayer.ppg || '0.0'}</div>
                        <div className="text-sm text-gray-400">PPG</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">{activePlayer.rpg || '0.0'}</div>
                        <div className="text-sm text-gray-400">RPG</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">{activePlayer.apg || '0.0'}</div>
                        <div className="text-sm text-gray-400">APG</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}