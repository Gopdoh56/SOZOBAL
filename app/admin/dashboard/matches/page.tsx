'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/Client';
import { Plus, Edit, Trash2, Search, X, Calendar, Clock, Trophy, BarChart3 } from 'lucide-react';

interface Match {
  id: string;
  division_id: string;
  home_team_id: string;
  away_team_id: string;
  venue_id: string;
  match_date: string;
  round_number: number;
  home_score: number;
  away_score: number;
  status: string;
  attendance: number;
  notes: string;
  home_team?: { name: string; logo_url: string };
  away_team?: { name: string; logo_url: string };
  venue?: { name: string };
  division?: { name: string };
}

interface ScoreBreakdown {
  home_q1: number;
  home_q2: number;
  home_q3: number;
  home_q4: number;
  home_ot: number;
  home_ot2: number;
  away_q1: number;
  away_q2: number;
  away_q3: number;
  away_q4: number;
  away_ot: number;
  away_ot2: number;
  winning_team_id: string;
}

interface PlayerStats {
  player_id: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  minutes_played: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_pointers_made: number;
  three_pointers_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [scoreData, setScoreData] = useState<ScoreBreakdown>({
    home_q1: 0, home_q2: 0, home_q3: 0, home_q4: 0, home_ot: 0, home_ot2: 0,
    away_q1: 0, away_q2: 0, away_q3: 0, away_q4: 0, away_ot: 0, away_ot2: 0,
    winning_team_id: '',
  });

  const [playerStatsData, setPlayerStatsData] = useState<PlayerStats[]>([]);
  
  const [formData, setFormData] = useState({
    division_id: '',
    home_team_id: '',
    away_team_id: '',
    venue_id: '',
    match_date: '',
    round_number: 1,
    home_score: 0,
    away_score: 0,
    status: 'scheduled',
    attendance: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    
    const [matchesData, divisionsData, teamsData, venuesData, playersData] = await Promise.all([
      supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name, logo_url),
          away_team:teams!matches_away_team_id_fkey(name, logo_url),
          venue:venues(name),
          division:divisions(name)
        `)
        .order('match_date', { ascending: false }),
      supabase.from('divisions').select('id, name, season').eq('is_active', true),
      supabase.from('teams').select('id, name, division_id').eq('is_active', true),
      supabase.from('venues').select('id, name'),
      supabase.from('players').select('*').eq('is_active', true),
    ]);

    if (matchesData.data) setMatches(matchesData.data);
    if (divisionsData.data) setDivisions(divisionsData.data);
    if (teamsData.data) setTeams(teamsData.data);
    if (venuesData.data) setVenues(venuesData.data);
    if (playersData.data) setPlayers(playersData.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.home_team_id === formData.away_team_id) {
      alert('Home and away teams cannot be the same!');
      return;
    }

    const supabase = createClient();

    if (editingMatch) {
      const { error } = await supabase
        .from('matches')
        .update(formData)
        .eq('id', editingMatch.id);

      if (!error) {
        alert('Match updated successfully!');
        loadData();
        closeModal();
      } else {
        alert('Error: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('matches')
        .insert([formData]);

      if (!error) {
        alert('Match created successfully!');
        loadData();
        closeModal();
      } else {
        alert('Error: ' + error.message);
      }
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    // Calculate total scores
    const homeTotal = scoreData.home_q1 + scoreData.home_q2 + scoreData.home_q3 + scoreData.home_q4 + scoreData.home_ot + scoreData.home_ot2;
    const awayTotal = scoreData.away_q1 + scoreData.away_q2 + scoreData.away_q3 + scoreData.away_q4 + scoreData.away_ot + scoreData.away_ot2;

    const supabase = createClient();
    
    // Update match with scores
    const { error: matchError } = await supabase
      .from('matches')
      .update({
        home_score: homeTotal,
        away_score: awayTotal,
        status: 'completed'
      })
      .eq('id', selectedMatch.id);

    if (matchError) {
      alert('Error updating match: ' + matchError.message);
      return;
    }

    // Save score breakdown
    const { error: scoreError } = await supabase
      .from('match_scores')
      .upsert({
        match_id: selectedMatch.id,
        ...scoreData
      });

    if (!scoreError) {
      alert('Score saved successfully!');
      loadData();
      closeScoreModal();
    } else {
      alert('Error saving score breakdown: ' + scoreError.message);
    }
  };

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    const supabase = createClient();

    // Delete existing stats for this match
    await supabase
      .from('player_match_stats')
      .delete()
      .eq('match_id', selectedMatch.id);

    // Insert new stats
    const statsToInsert = playerStatsData
      .filter(stat => stat.player_id)
      .map(stat => ({
        match_id: selectedMatch.id,
        ...stat
      }));

    if (statsToInsert.length === 0) {
      alert('Please add at least one player stat');
      return;
    }

    const { error } = await supabase
      .from('player_match_stats')
      .insert(statsToInsert);

    if (!error) {
      alert('Player stats saved successfully!');
      closeStatsModal();
    } else {
      alert('Error saving stats: ' + error.message);
    }
  };

  const openScoreModal = (match: Match) => {
    setSelectedMatch(match);
    setScoreData({
      home_q1: 0, home_q2: 0, home_q3: 0, home_q4: 0, home_ot: 0, home_ot2: 0,
      away_q1: 0, away_q2: 0, away_q3: 0, away_q4: 0, away_ot: 0, away_ot2: 0,
      winning_team_id: '',
    });
    setShowScoreModal(true);
  };

  const closeScoreModal = () => {
    setShowScoreModal(false);
    setSelectedMatch(null);
  };

  const openStatsModal = (match: Match) => {
    setSelectedMatch(match);
    // Initialize with empty player stats
    const homePlayers = players.filter(p => p.team_id === match.home_team_id);
    const awayPlayers = players.filter(p => p.team_id === match.away_team_id);
    
    const initialStats = [...homePlayers, ...awayPlayers].map(player => ({
      player_id: player.id,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      minutes_played: 0,
      field_goals_made: 0,
      field_goals_attempted: 0,
      three_pointers_made: 0,
      three_pointers_attempted: 0,
      free_throws_made: 0,
      free_throws_attempted: 0,
    }));
    
    setPlayerStatsData(initialStats);
    setShowStatsModal(true);
  };

  const closeStatsModal = () => {
    setShowStatsModal(false);
    setSelectedMatch(null);
    setPlayerStatsData([]);
  };

  const updatePlayerStat = (playerIndex: number, field: keyof PlayerStats, value: number) => {
    const newStats = [...playerStatsData];
    newStats[playerIndex] = { ...newStats[playerIndex], [field]: value };
    setPlayerStatsData(newStats);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Match deleted successfully!');
      loadData();
    } else {
      alert('Error: ' + error.message);
    }
  };

  const openModal = (match?: Match) => {
    if (match) {
      setEditingMatch(match);
      setFormData({
        division_id: match.division_id,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        venue_id: match.venue_id || '',
        match_date: match.match_date ? match.match_date.slice(0, 16) : '',
        round_number: match.round_number || 1,
        home_score: match.home_score,
        away_score: match.away_score,
        status: match.status,
        attendance: match.attendance || 0,
        notes: match.notes || '',
      });
    } else {
      setEditingMatch(null);
      setFormData({
        division_id: divisions[0]?.id || '',
        home_team_id: '',
        away_team_id: '',
        venue_id: '',
        match_date: '',
        round_number: 1,
        home_score: 0,
        away_score: 0,
        status: 'scheduled',
        attendance: 0,
        notes: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMatch(null);
  };

  const filteredMatches = matches.filter((match) => {
    const matchesSearch = 
      match.home_team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.away_team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || match.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'live': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'postponed': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const availableTeams = teams.filter(t => t.division_id === formData.division_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-600 mt-1">Schedule and manage league matches</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Match
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {new Date(match.match_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Clock className="w-5 h-5 text-gray-400 ml-4" />
                <span className="text-sm font-medium text-gray-600">
                  {new Date(match.match_date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(match.status)}`}>
                  {match.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">{match.division?.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              {/* Home Team */}
              <div className="flex items-center gap-3 flex-1">
                {match.home_team?.logo_url ? (
                  <img src={match.home_team.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold">{match.home_team?.name[0]}</span>
                  </div>
                )}
                <span className="font-semibold text-lg text-gray-900">{match.home_team?.name}</span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4 px-6">
                {match.status === 'completed' || match.status === 'live' ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900">{match.home_score}</span>
                    <span className="text-gray-400 font-medium">-</span>
                    <span className="text-3xl font-bold text-gray-900">{match.away_score}</span>
                  </>
                ) : (
                  <span className="text-gray-400 font-medium">VS</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-3 flex-1 justify-end">
                <span className="font-semibold text-lg text-gray-900">{match.away_team?.name}</span>
                {match.away_team?.logo_url ? (
                  <img src={match.away_team.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold">{match.away_team?.name[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {(match.venue?.name || match.notes) && (
              <div className="mb-4 text-sm text-gray-600 space-y-1">
                {match.venue?.name && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Venue:</span>
                    <span>{match.venue.name}</span>
                  </div>
                )}
                {match.notes && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium">Notes:</span>
                    <span>{match.notes}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => openScoreModal(match)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Match Score
              </button>
              <button
                onClick={() => openStatsModal(match)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Match Stats
              </button>
              <button
                onClick={() => openModal(match)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(match.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No matches found</p>
        </div>
      )}


      {/* Score Modal */}
      {showScoreModal && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">Match Score Breakdown</h2>
              <button onClick={closeScoreModal} className="text-black hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleScoreSubmit} className="p-6 space-y-6">
              <div className="text-center mb-4">
                <p className="text-lg font-semibold text-black">
                  {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                </p>
              </div>

              {/* Quarter Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['q1', 'q2', 'q3', 'q4', 'ot', 'ot2'].map((quarter, idx) => (
                  <div key={quarter} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-black mb-3 text-center">
                      {quarter === 'ot' ? 'Overtime' : quarter === 'ot2' ? '2nd OT' : `Quarter ${idx + 1}`}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-black mb-1">
                          {selectedMatch.home_team?.name}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreData[`home_${quarter}` as keyof ScoreBreakdown]}
                          onChange={(e) => setScoreData({ ...scoreData, [`home_${quarter}`]: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-black mb-1">
                          {selectedMatch.away_team?.name}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreData[`away_${quarter}` as keyof ScoreBreakdown]}
                          onChange={(e) => setScoreData({ ...scoreData, [`away_${quarter}`]: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Scores */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-black">Final Score</h3>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-sm text-black mb-2">{selectedMatch.home_team?.name}</p>
                    <p className="text-4xl font-bold text-black">
                      {scoreData.home_q1 + scoreData.home_q2 + scoreData.home_q3 + scoreData.home_q4 + scoreData.home_ot + scoreData.home_ot2}
                    </p>
                  </div>
                  <div className="text-2xl text-black">-</div>
                  <div className="text-center">
                    <p className="text-sm text-black mb-2">{selectedMatch.away_team?.name}</p>
                    <p className="text-4xl font-bold text-black">
                      {scoreData.away_q1 + scoreData.away_q2 + scoreData.away_q3 + scoreData.away_q4 + scoreData.away_ot + scoreData.away_ot2}
                    </p>
                  </div>
                </div>
              </div>

              {/* Winning Team */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Winning Team *
                </label>
                <select
                  required
                  value={scoreData.winning_team_id}
                  onChange={(e) => setScoreData({ ...scoreData, winning_team_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="">Select Winner</option>
                  <option value={selectedMatch.home_team_id}>{selectedMatch.home_team?.name}</option>
                  <option value={selectedMatch.away_team_id}>{selectedMatch.away_team?.name}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeScoreModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">Player Match Statistics</h2>
              <button onClick={closeStatsModal} className="text-black hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleStatsSubmit} className="p-6">
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-black">
                  {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                </p>
              </div>

              <div className="space-y-8">
                {/* Home Team Players */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-black">{selectedMatch.home_team?.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left text-black">Player</th>
                          <th className="px-2 py-2 text-center text-black">MIN</th>
                          <th className="px-2 py-2 text-center text-black">PTS</th>
                          <th className="px-2 py-2 text-center text-black">REB</th>
                          <th className="px-2 py-2 text-center text-black">AST</th>
                          <th className="px-2 py-2 text-center text-black">STL</th>
                          <th className="px-2 py-2 text-center text-black">BLK</th>
                          <th className="px-2 py-2 text-center text-black">TO</th>
                          <th className="px-2 py-2 text-center text-black">PF</th>
                          <th className="px-2 py-2 text-center text-black">FG</th>
                          <th className="px-2 py-2 text-center text-black">3PT</th>
                          <th className="px-2 py-2 text-center text-black">FT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerStatsData
                          .map((stat, idx) => ({ stat, idx, player: players.find(p => p.id === stat.player_id) }))
                          .filter(({ player }) => player?.team_id === selectedMatch.home_team_id)
                          .map(({ stat, idx, player }) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-2 font-medium text-black">
                                {player ? `${player.first_name} ${player.last_name} #${player.jersey_number}` : 'Unknown'}
                              </td>
                              {/* Added spinner-hide classes and text-black to all inputs below */}
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.minutes_played} onChange={(e) => updatePlayerStat(idx, 'minutes_played', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.points} onChange={(e) => updatePlayerStat(idx, 'points', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.rebounds} onChange={(e) => updatePlayerStat(idx, 'rebounds', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.assists} onChange={(e) => updatePlayerStat(idx, 'assists', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.steals} onChange={(e) => updatePlayerStat(idx, 'steals', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.blocks} onChange={(e) => updatePlayerStat(idx, 'blocks', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.turnovers} onChange={(e) => updatePlayerStat(idx, 'turnovers', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.fouls} onChange={(e) => updatePlayerStat(idx, 'fouls', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1 text-black">
                                  <input type="number" min="0" value={stat.field_goals_made} onChange={(e) => updatePlayerStat(idx, 'field_goals_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="M" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.field_goals_attempted} onChange={(e) => updatePlayerStat(idx, 'field_goals_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="A" />
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1 text-black">
                                  <input type="number" min="0" value={stat.three_pointers_made} onChange={(e) => updatePlayerStat(idx, 'three_pointers_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="M" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.three_pointers_attempted} onChange={(e) => updatePlayerStat(idx, 'three_pointers_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="A" />
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1 text-black">
                                  <input type="number" min="0" value={stat.free_throws_made} onChange={(e) => updatePlayerStat(idx, 'free_throws_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="M" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.free_throws_attempted} onChange={(e) => updatePlayerStat(idx, 'free_throws_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="A" />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Away Team Players */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-black">{selectedMatch.away_team?.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left text-black">Player</th>
                          <th className="px-2 py-2 text-center text-black">MIN</th>
                          <th className="px-2 py-2 text-center text-black">PTS</th>
                          <th className="px-2 py-2 text-center text-black">REB</th>
                          <th className="px-2 py-2 text-center text-black">AST</th>
                          <th className="px-2 py-2 text-center text-black">STL</th>
                          <th className="px-2 py-2 text-center text-black">BLK</th>
                          <th className="px-2 py-2 text-center text-black">TO</th>
                          <th className="px-2 py-2 text-center text-black">PF</th>
                          <th className="px-2 py-2 text-center text-black">FG</th>
                          <th className="px-2 py-2 text-center text-black">3PT</th>
                          <th className="px-2 py-2 text-center text-black">FT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerStatsData
                          .map((stat, idx) => ({ stat, idx, player: players.find(p => p.id === stat.player_id) }))
                          .filter(({ player }) => player?.team_id === selectedMatch.away_team_id)
                          .map(({ stat, idx, player }) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-2 font-medium text-black">
                                {player ? `${player.first_name} ${player.last_name} #${player.jersey_number}` : 'Unknown'}
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.minutes_played} onChange={(e) => updatePlayerStat(idx, 'minutes_played', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.points} onChange={(e) => updatePlayerStat(idx, 'points', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.rebounds} onChange={(e) => updatePlayerStat(idx, 'rebounds', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.assists} onChange={(e) => updatePlayerStat(idx, 'assists', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.steals} onChange={(e) => updatePlayerStat(idx, 'steals', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.blocks} onChange={(e) => updatePlayerStat(idx, 'blocks', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.turnovers} onChange={(e) => updatePlayerStat(idx, 'turnovers', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" min="0" value={stat.fouls} onChange={(e) => updatePlayerStat(idx, 'fouls', parseInt(e.target.value) || 0)} className="w-16 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1 text-black">
                                  <input type="number" min="0" value={stat.field_goals_made} onChange={(e) => updatePlayerStat(idx, 'field_goals_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="M" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.field_goals_attempted} onChange={(e) => updatePlayerStat(idx, 'field_goals_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="A" />
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1 text-black">
                                  <input type="number" min="0" value={stat.three_pointers_made} onChange={(e) => updatePlayerStat(idx, 'three_pointers_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="M" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.three_pointers_attempted} onChange={(e) => updatePlayerStat(idx, 'three_pointers_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="A" />
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex gap-1 text-black">
                                  <input type="number" min="0" value={stat.free_throws_made} onChange={(e) => updatePlayerStat(idx, 'free_throws_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="M" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.free_throws_attempted} onChange={(e) => updatePlayerStat(idx, 'free_throws_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="A" />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeStatsModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Player Stats
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      

      {/* Edit Match Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMatch ? 'Edit Match' : 'Schedule New Match'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Division *
                  </label>
                  <select
                    required
                    value={formData.division_id}
                    onChange={(e) => setFormData({ ...formData, division_id: e.target.value, home_team_id: '', away_team_id: '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.name} - {div.season}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Team *
                  </label>
                  <select
                    required
                    value={formData.home_team_id}
                    onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={!formData.division_id}
                  >
                    <option value="">Select Home Team</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id} disabled={team.id === formData.away_team_id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Away Team *
                  </label>
                  <select
                    required
                    value={formData.away_team_id}
                    onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={!formData.division_id}
                  >
                    <option value="">Select Away Team</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id} disabled={team.id === formData.home_team_id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.match_date}
                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <select
                    value={formData.venue_id}
                    onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select Venue</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.round_number}
                    onChange={(e) => setFormData({ ...formData, round_number: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes or information"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingMatch ? 'Update Match' : 'Schedule Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}