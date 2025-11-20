// app/admin/dashboard/matches/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/Client';
import { Plus, Edit, Trash2, Search, X, Calendar, Clock } from 'lucide-react';

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

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    
    const [matchesData, divisionsData, teamsData, venuesData] = await Promise.all([
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
    ]);

    if (matchesData.data) setMatches(matchesData.data);
    if (divisionsData.data) setDivisions(divisionsData.data);
    if (teamsData.data) setTeams(teamsData.data);
    if (venuesData.data) setVenues(venuesData.data);
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

            <div className="flex gap-2">
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

      {/* Modal */}
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
                    Home Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.home_score}
                    onChange={(e) => setFormData({ ...formData, home_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Away Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.away_score}
                    onChange={(e) => setFormData({ ...formData, away_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
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