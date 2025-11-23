// app/admin/dashboard/teams/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/Client';
import { Plus, Edit, Trash2, Search, X, Users, ArrowLeft } from 'lucide-react';

interface Team {
  id: string;
  division_id: string | null;
  name: string;
  short_name: string;
  coach_name: string;
  assistant_coach: string;
  home_city: string;
  logo_url: string;
  founded_year: number;
  team_color: string;
  wins: number;
  losses: number;
  points: number;
  is_active: boolean;
  division?: { name: string };
}

interface Division {
  id: string;
  name: string;
  season: string;
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
  date_of_birth: string;
  height_cm: number;
  weight_kg: number;
  team_id: string;
  is_active: boolean;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  
  // Player management states
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  
  const [formData, setFormData] = useState({
    division_id: '',
    name: '',
    short_name: '',
    coach_name: '',
    assistant_coach: '',
    home_city: '',
    logo_url: '',
    founded_year: new Date().getFullYear(),
    team_color: '#FF6B35',
    wins: 0,
    losses: 0,
    points: 0,
    is_active: true,
  });

  const [playerFormData, setPlayerFormData] = useState({
    first_name: '',
    last_name: '',
    jersey_number: '',
    position: '',
    date_of_birth: '',
    height_cm: '',
    weight_kg: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    
    const [teamsData, divisionsData] = await Promise.all([
      supabase
        .from('teams')
        .select('*, division:divisions(name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('divisions')
        .select('id, name, season')
        .eq('is_active', true)
        .order('name'),
    ]);

    if (teamsData.data) setTeams(teamsData.data);
    if (divisionsData.data) setDivisions(divisionsData.data);
    setLoading(false);
  };

  const loadTeamPlayers = async (teamId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('jersey_number');

    if (error) {
      console.error('Error loading players:', error);
    } else if (data) {
      setTeamPlayers(data);
    }
  };

  const handleTeamClick = async (team: Team) => {
    setSelectedTeam(team);
    await loadTeamPlayers(team.id);
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setTeamPlayers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const supabase = createClient();

  // Convert empty string to null for division_id
  const teamData = {
    ...formData,
    division_id: formData.division_id || null,
  };

  if (editingTeam) {
    const { error } = await supabase
      .from('teams')
      .update(teamData)  // ← Use teamData instead of formData
      .eq('id', editingTeam.id);

    if (!error) {
      alert('Team updated successfully!');
      loadData();
      closeModal();
    } else {
      alert('Error updating team: ' + error.message);
    }
  } else {
    const { error } = await supabase
      .from('teams')
      .insert([teamData]);  // ← Use teamData instead of formData

    if (!error) {
      alert('Team created successfully!');
      loadData();
      closeModal();
    } else {
      alert('Error creating team: ' + error.message);
    }
  }
};

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const supabase = createClient();

    const playerData = {
      first_name: playerFormData.first_name,
      last_name: playerFormData.last_name,
      jersey_number: playerFormData.jersey_number ? parseInt(playerFormData.jersey_number) : null,
      position: playerFormData.position || null,
      date_of_birth: playerFormData.date_of_birth || null,
      height_cm: playerFormData.height_cm ? parseInt(playerFormData.height_cm) : null,
      weight_kg: playerFormData.weight_kg ? parseFloat(playerFormData.weight_kg) : null,
      team_id: selectedTeam.id,
      is_active: playerFormData.is_active,
    };

    if (editingPlayer) {
      const { error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', editingPlayer.id);

      if (!error) {
        alert('Player updated successfully!');
        loadTeamPlayers(selectedTeam.id);
        closePlayerModal();
      } else {
        alert('Error updating player: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('players')
        .insert([playerData]);

      if (!error) {
        alert('Player added successfully!');
        loadTeamPlayers(selectedTeam.id);
        closePlayerModal();
      } else {
        alert('Error adding player: ' + error.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team? This will also delete all related data.')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Team deleted successfully!');
      loadData();
    } else {
      alert('Error deleting team: ' + error.message);
    }
  };

  const handlePlayerDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    if (!selectedTeam) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Player deleted successfully!');
      loadTeamPlayers(selectedTeam.id);
    } else {
      alert('Error deleting player: ' + error.message);
    }
  };

  const openModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        division_id: team.division_id || '',
        name: team.name,
        short_name: team.short_name || '',
        coach_name: team.coach_name || '',
        assistant_coach: team.assistant_coach || '',
        home_city: team.home_city || '',
        logo_url: team.logo_url || '',
        founded_year: team.founded_year || new Date().getFullYear(),
        team_color: team.team_color || '#FF6B35',
        wins: team.wins,
        losses: team.losses,
        points: team.points,
        is_active: team.is_active,
      });
    } else {
      setEditingTeam(null);
      setFormData({
        division_id: '',
        name: '',
        short_name: '',
        coach_name: '',
        assistant_coach: '',
        home_city: '',
        logo_url: '',
        founded_year: new Date().getFullYear(),
        team_color: '#FF6B35',
        wins: 0,
        losses: 0,
        points: 0,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
  };

  const openPlayerModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerFormData({
        first_name: player.first_name,
        last_name: player.last_name,
        jersey_number: player.jersey_number.toString(),
        position: player.position || '',
        date_of_birth: player.date_of_birth || '',
        height_cm: player.height_cm ? player.height_cm.toString() : '',
        weight_kg: player.weight_kg ? player.weight_kg.toString() : '',
        is_active: player.is_active,
      });
    } else {
      setEditingPlayer(null);
      setPlayerFormData({
        first_name: '',
        last_name: '',
        jersey_number: '',
        position: '',
        date_of_birth: '',
        height_cm: '',
        weight_kg: '',
        is_active: true,
      });
    }
    setShowPlayerModal(true);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setEditingPlayer(null);
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.coach_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.home_city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = !filterDivision || team.division_id === filterDivision;
    return matchesSearch && matchesDivision;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Player Management View
  if (selectedTeam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToTeams}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
            <div className="flex items-center gap-3">
              {selectedTeam.logo_url ? (
                <img src={selectedTeam.logo_url} alt={selectedTeam.name} className="w-12 h-12 rounded-lg" />
              ) : (
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: selectedTeam.team_color }}
                >
                  {selectedTeam.short_name?.[0] || selectedTeam.name[0]}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-black">{selectedTeam.name}</h1>
                <p className="text-black mt-1">Manage team players</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => openPlayerModal()}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Player
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-lg">
                      #{player.jersey_number}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {player.first_name} {player.last_name}
                    </h3>
                    {player.position && (
                      <p className="text-sm text-black">{player.position}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    player.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  {player.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {player.height_cm && (
                  <div className="flex justify-between">
                    <span className="text-black">Height:</span>
                    <span className="font-medium text-black">{player.height_cm} cm</span>
                  </div>
                )}
                {player.weight_kg && (
                  <div className="flex justify-between">
                    <span className="text-black">Weight:</span>
                    <span className="font-medium text-black">{player.weight_kg} kg</span>
                  </div>
                )}
                {player.date_of_birth && (
                  <div className="flex justify-between">
                    <span className="text-black">DOB:</span>
                    <span className="font-medium text-black">{new Date(player.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openPlayerModal(player)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handlePlayerDelete(player.id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {teamPlayers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-black mb-4">No players in this team yet</p>
            <button
              onClick={() => openPlayerModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Player
            </button>
          </div>
        )}

        {showPlayerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-black">
                  {editingPlayer ? 'Edit Player' : 'Add New Player'}
                </h2>
                <button onClick={closePlayerModal} className="text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handlePlayerSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={playerFormData.first_name}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={playerFormData.last_name}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Jersey Number
                    </label>
                    <input
                      type="number"
                      value={playerFormData.jersey_number}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, jersey_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="e.g., 7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Position
                    </label>
                    <select
                      value={playerFormData.position}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    >
                      <option value="">Select position</option>
                      <option value="PG">Point Guard (PG)</option>
                      <option value="SG">Shooting Guard (SG)</option>
                      <option value="SF">Small Forward (SF)</option>
                      <option value="PF">Power Forward (PF)</option>
                      <option value="C">Center (C)</option>
                      <option value="G">Guard (G)</option>
                      <option value="F">Forward (F)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={playerFormData.date_of_birth}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={playerFormData.height_cm}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, height_cm: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="e.g., 180"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={playerFormData.weight_kg}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, weight_kg: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="e.g., 75.2"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="player_is_active"
                      checked={playerFormData.is_active}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, is_active: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="player_is_active" className="text-sm font-medium text-black">
                      Active Player
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closePlayerModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {editingPlayer ? 'Update Player' : 'Add Player'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Teams List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Teams</h1>
          <p className="text-black mt-1">Manage teams across all divisions</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
          />
        </div>
        <select
          value={filterDivision}
          onChange={(e) => setFilterDivision(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
        >
          <option value="">All Divisions</option>
          {divisions.map((div) => (
            <option key={div.id} value={div.id}>{div.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div
              onClick={() => handleTeamClick(team)}
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl"
            >
              <div className="flex items-start gap-4 mb-4">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: team.team_color }}
                  >
                    {team.short_name?.[0] || team.name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black">{team.name}</h3>
                  <p className="text-sm text-black">{team.division?.name}</p>
                  {team.home_city && (
                    <p className="text-xs text-black mt-1">{team.home_city}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    team.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-black'
                  }`}
                >
                  {team.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {team.coach_name && (
                  <div className="flex justify-between">
                    <span className="text-black">Coach:</span>
                    <span className="font-medium text-black">{team.coach_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-black">Record:</span>
                  <span className="font-medium text-black">{team.wins}W - {team.losses}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Points:</span>
                  <span className="font-medium text-black">{team.points}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 pt-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(team);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(team.id);
                }}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-black">No teams found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">
                {editingTeam ? 'Edit Team' : 'Add New Team'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Division *
                  </label>
                  <select
                    value={formData.division_id}
                    onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  
                  >
                    <option value="">Select Division (Optional)</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.name} - {div.season}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    placeholder="e.g., Lakers"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Short Name
                  </label>
                  <input
                    type="text"
                    value={formData.short_name}
                    onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    placeholder="e.g., LAL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Coach Name
                  </label>
                  <input
                    type="text"
                    value={formData.coach_name}
                    onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    placeholder="Head coach name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Assistant Coach
                  </label>
                  <input
                    type="text"
                    value={formData.assistant_coach}
                    onChange={(e) => setFormData({ ...formData, assistant_coach: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    placeholder="Assistant coach name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Home City
                  </label>
                  <input
                    type="text"
                    value={formData.home_city}
                    onChange={(e) => setFormData({ ...formData, home_city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    placeholder="e.g., Los Angeles"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => setFormData({ ...formData, founded_year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Team Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.team_color}
                      onChange={(e) => setFormData({ ...formData, team_color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.team_color}
                      onChange={(e) => setFormData({ ...formData, team_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="#FF6B35"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Wins
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.wins}
                    onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Losses
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.losses}
                    onChange={(e) => setFormData({ ...formData, losses: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-black">
                    Active Team
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingTeam ? 'Update Team' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}