'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/Client';
import { Plus, Edit, Trash2, Search, X, Calendar, Clock, Tag, BarChart3 } from 'lucide-react';

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
  match_type: string;
  league_name: string;
  tournament_name: string;
  custom_category: string;
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
  const [matchTypeFilter, setMatchTypeFilter] = useState('');
  
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
    match_type: 'league',
    league_name: '',
    tournament_name: '',
    custom_category: '',
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

  const formatMatchDate = (dateString: string) => {
    if (!dateString) return { date: '', time: '' };
    
    const [datePart, timePart] = dateString.split('T');
    
    if (!datePart) return { date: '', time: '' };
    
    const [year, month, day] = datePart.split('-');
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dateFormatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    let time = '';
    if (timePart) {
      const [hours, minutes] = timePart.split(':');
      const hour = parseInt(hours);
      const min = minutes || '00';
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      time = `${hour12}:${min} ${period}`;
    }
    
    return { date: dateFormatted, time };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.home_team_id === formData.away_team_id) {
      alert('Home and away teams cannot be the same!');
      return;
    }

    if (formData.match_type === 'league' && !formData.league_name) {
      alert('Please enter a league name');
      return;
    }
    if (formData.match_type === 'tournament' && !formData.tournament_name) {
      alert('Please enter a tournament name');
      return;
    }
    if (formData.match_type === 'custom' && !formData.custom_category) {
      alert('Please enter a custom category name');
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
      let localDate = '';
      if (match.match_date) {
        localDate = match.match_date.substring(0, 16);
      }
      setFormData({
        division_id: match.division_id,
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        venue_id: match.venue_id || '',
        match_date: localDate,
        round_number: match.round_number || 1,
        home_score: match.home_score,
        away_score: match.away_score,
        status: match.status,
        attendance: match.attendance || 0,
        notes: match.notes || '',
        match_type: match.match_type || 'league',
        league_name: match.league_name || '',
        tournament_name: match.tournament_name || '',
        custom_category: match.custom_category || '',
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
        match_type: 'league',
        league_name: '',
        tournament_name: '',
        custom_category: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMatch(null);
  };

  const getMatchCategory = (match: Match) => {
    switch (match.match_type) {
      case 'friendly':
        return 'Friendly Match';
      case 'league':
        return match.league_name || 'League Game';
      case 'tournament':
        return match.tournament_name || 'Tournament';
      case 'custom':
        return match.custom_category || 'Custom Match';
      default:
        return 'Match';
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'friendly': return 'bg-blue-100 text-black';
      case 'league': return 'bg-purple-100 text-black';
      case 'tournament': return 'bg-amber-100 text-black';
      case 'custom': return 'bg-teal-100 text-black';
      default: return 'bg-gray-100 text-black';
    }
  };

  const filteredMatches = matches.filter((match) => {
    const matchesSearch = 
      match.home_team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.away_team?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMatchCategory(match).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || match.status === statusFilter;
    const matchesType = !matchTypeFilter || match.match_type === matchTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-black';
      case 'live': return 'bg-green-100 text-black';
      case 'completed': return 'bg-gray-100 text-black';
      case 'postponed': return 'bg-yellow-100 text-black';
      case 'cancelled': return 'bg-red-100 text-black';
      default: return 'bg-gray-100 text-black';
    }
  };

  // Helper function to group teams by division with better labels
  const getTeamsGroupedByDivision = () => {
    const grouped: { [key: string]: any[] } = {};
    
    teams.forEach(team => {
      if (team.division_id) {
        const division = divisions.find(d => d.id === team.division_id);
        const divisionLabel = division ? `${division.name} - ${division.season}` : 'Unknown Division';
        
        if (!grouped[divisionLabel]) {
          grouped[divisionLabel] = [];
        }
        grouped[divisionLabel].push(team);
      } else {
        if (!grouped['Independent Teams']) {
          grouped['Independent Teams'] = [];
        }
        grouped['Independent Teams'].push(team);
      }
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Matches</h1>
          <p className="text-black mt-1">Schedule and manage league matches</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Match
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input
            type="text"
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
          />
        </div>
        <select
          value={matchTypeFilter}
          onChange={(e) => setMatchTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
        >
          <option value="">All Types</option>
          <option value="friendly">Friendly</option>
          <option value="league">League</option>
          <option value="tournament">Tournament</option>
          <option value="custom">Custom</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredMatches.map((match) => {
          const { date, time } = formatMatchDate(match.match_date);
          return (
            <div
              key={match.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-black" />
                  <span className="text-sm font-medium text-black">{date}</span>
                  {time && (
                    <>
                      <Clock className="w-5 h-5 text-black ml-4" />
                      <span className="text-sm font-medium text-black">{time}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getMatchTypeColor(match.match_type)}`}>
                    <Tag className="w-3 h-3 inline mr-1" />
                    {getMatchCategory(match)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(match.status)}`}>
                    {match.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-black">{match.division?.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {match.home_team?.logo_url ? (
                    <img src={match.home_team.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600 font-bold">{match.home_team?.name[0]}</span>
                    </div>
                  )}
                  <span className="font-semibold text-lg text-black">{match.home_team?.name}</span>
                </div>

                <div className="flex items-center gap-4 px-6">
                  {match.status === 'completed' || match.status === 'live' ? (
                    <>
                      <span className="text-3xl font-bold text-black">{match.home_score}</span>
                      <span className="text-black font-medium">-</span>
                      <span className="text-3xl font-bold text-black">{match.away_score}</span>
                    </>
                  ) : (
                    <span className="text-black font-medium">VS</span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-semibold text-lg text-black">{match.away_team?.name}</span>
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
                <div className="mb-4 text-sm text-black space-y-1">
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
                  onClick={() => window.location.href = `/match-stats?id=${match.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Stats
                </button>
                <button
                  onClick={() => openModal(match)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
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
          );
        })}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-black mx-auto mb-4" />
          <p className="text-black">No matches found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">
                {editingMatch ? 'Edit Match' : 'Schedule New Match'}
              </h2>
              <button onClick={closeModal} className="text-black hover:text-black">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Match Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['friendly', 'league', 'tournament', 'custom'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, match_type: type })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-black ${
                          formData.match_type === type
                            ? 'border-orange-600 bg-orange-50 font-semibold'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.match_type === 'league' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      League Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.league_name}
                      onChange={(e) => setFormData({ ...formData, league_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="e.g., sozobal, National Championship"
                    />
                  </div>
                )}

                {formData.match_type === 'tournament' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Tournament Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tournament_name}
                      onChange={(e) => setFormData({ ...formData, tournament_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="e.g., Summer Cup, Regional Finals"
                    />
                  </div>
                )}

                {formData.match_type === 'custom' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Custom Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.custom_category}
                      onChange={(e) => setFormData({ ...formData, custom_category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                      placeholder="e.g., Charity Game, All-Star Match"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Division (Optional - for categorization only)
                  </label>
                  <select
                    value={formData.division_id}
                    onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  >
                    <option value="">No Division (Independent Match)</option>
                    {divisions.map((div) => (
                      <option key={div.id} value={div.id}>
                        {div.name} - {div.season}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">You can select teams from any division regardless of this selection</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Home Team *
                  </label>
                  <select
                    required
                    value={formData.home_team_id}
                    onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  >
                    <option value="">Select Home Team</option>
                    {Object.entries(getTeamsGroupedByDivision()).map(([divisionLabel, divisionTeams]) => (
                      <optgroup key={divisionLabel} label={divisionLabel}>
                        {divisionTeams.map((team) => (
                          <option 
                            key={team.id} 
                            value={team.id} 
                            disabled={team.id === formData.away_team_id}
                          >
                            {team.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Away Team *
                  </label>
                  <select
                    required
                    value={formData.away_team_id}
                    onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  >
                    <option value="">Select Away Team</option>
                    {Object.entries(getTeamsGroupedByDivision()).map(([divisionLabel, divisionTeams]) => (
                      <optgroup key={divisionLabel} label={divisionLabel}>
                        {divisionTeams.map((team) => (
                          <option 
                            key={team.id} 
                            value={team.id} 
                            disabled={team.id === formData.home_team_id}
                          >
                            {team.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Match Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.match_date}
                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Venue
                  </label>
                  <select
                    value={formData.venue_id}
                    onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
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
                  <label className="block text-sm font-medium text-black mb-2">
                    Round Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.round_number}
                    onChange={(e) => setFormData({ ...formData, round_number: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Attendance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    rows={3}
                    placeholder="Any additional notes or information"
                  />
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
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  {editingMatch ? 'Update Match' : 'Schedule Match'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}