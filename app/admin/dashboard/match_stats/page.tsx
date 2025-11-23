'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/Client';
import { Search, Trophy, BarChart3, Calendar, Clock, ChevronRight, Save } from 'lucide-react';

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

export default function MatchRecordingPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [recordingView, setRecordingView] = useState<'score' | 'stats' | null>(null);
  
  const [scoreData, setScoreData] = useState<ScoreBreakdown>({
    home_q1: 0, home_q2: 0, home_q3: 0, home_q4: 0, home_ot: 0, home_ot2: 0,
    away_q1: 0, away_q2: 0, away_q3: 0, away_q4: 0, away_ot: 0, away_ot2: 0,
    winning_team_id: '',
  });

  const [playerStatsData, setPlayerStatsData] = useState<PlayerStats[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    
    const [matchesData, playersData] = await Promise.all([
      supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(name, logo_url),
          away_team:teams!matches_away_team_id_fkey(name, logo_url),
          venue:venues(name),
          division:divisions(name)
        `)
        .order('match_date', { ascending: true }),
      supabase.from('players').select('*').eq('is_active', true),
    ]);

    if (matchesData.data) setMatches(matchesData.data);
    if (playersData.data) setPlayers(playersData.data);
    setLoading(false);
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    const homeTotal = scoreData.home_q1 + scoreData.home_q2 + scoreData.home_q3 + scoreData.home_q4 + scoreData.home_ot + scoreData.home_ot2;
    const awayTotal = scoreData.away_q1 + scoreData.away_q2 + scoreData.away_q3 + scoreData.away_q4 + scoreData.away_ot + scoreData.away_ot2;

    const supabase = createClient();
    
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

    const { error: scoreError } = await supabase
      .from('match_scores')
      .upsert({
        match_id: selectedMatch.id,
        ...scoreData
      });

    if (!scoreError) {
      alert('Score saved successfully!');
      loadData();
      setRecordingView('stats');
    } else {
      alert('Error saving score breakdown: ' + scoreError.message);
    }
  };

  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    const supabase = createClient();

    await supabase
      .from('player_match_stats')
      .delete()
      .eq('match_id', selectedMatch.id);

    const statsToInsert = playerStatsData
      .filter(stat => stat.player_id && (stat.points > 0 || stat.minutes_played > 0))
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
      backToMatchList();
    } else {
      alert('Error saving stats: ' + error.message);
    }
  };

  const startRecording = (match: Match, view: 'score' | 'stats') => {
    setSelectedMatch(match);
    setRecordingView(view);
    
    if (view === 'score') {
      setScoreData({
        home_q1: 0, home_q2: 0, home_q3: 0, home_q4: 0, home_ot: 0, home_ot2: 0,
        away_q1: 0, away_q2: 0, away_q3: 0, away_q4: 0, away_ot: 0, away_ot2: 0,
        winning_team_id: '',
      });
    } else if (view === 'stats') {
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
    }
  };

  const backToMatchList = () => {
    setSelectedMatch(null);
    setRecordingView(null);
    setPlayerStatsData([]);
    loadData();
  };

  const updatePlayerStat = (playerIndex: number, field: keyof PlayerStats, value: number) => {
    const newStats = [...playerStatsData];
    newStats[playerIndex] = { ...newStats[playerIndex], [field]: value };
    setPlayerStatsData(newStats);
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
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Match List View
  if (!selectedMatch || !recordingView) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Record Match Results</h1>
            <p className="text-gray-600 mt-1">Select a match to record scores and player statistics</p>
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

                {match.venue?.name && (
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-medium">Venue:</span> {match.venue.name}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => startRecording(match, 'score')}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                    Record Score
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startRecording(match, 'stats')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Record Stats
                    <ChevronRight className="w-4 h-4" />
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
        </div>
      </div>
    );
  }

  // Score Recording View
  if (recordingView === 'score') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={backToMatchList}
            className="mb-6 text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Back to Matches
          </button>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Match Score Breakdown</h2>
              <p className="text-lg font-semibold text-gray-700">
                {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedMatch.match_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <form onSubmit={handleScoreSubmit} className="space-y-6">
              {/* Quarter Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['q1', 'q2', 'q3', 'q4', 'ot', 'ot2'].map((quarter, idx) => (
                  <div key={quarter} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 text-center">
                      {quarter === 'ot' ? 'Overtime' : quarter === 'ot2' ? '2nd OT' : `Quarter ${idx + 1}`}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          {selectedMatch.home_team?.name}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreData[`home_${quarter}` as keyof ScoreBreakdown]}
                          onChange={(e) => setScoreData({ ...scoreData, [`home_${quarter}`]: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">
                          {selectedMatch.away_team?.name}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={scoreData[`away_${quarter}` as keyof ScoreBreakdown]}
                          onChange={(e) => setScoreData({ ...scoreData, [`away_${quarter}`]: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Scores */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border-2 border-orange-200">
                <h3 className="text-lg font-bold mb-4 text-gray-900 text-center">Final Score</h3>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-700 mb-2 font-medium">{selectedMatch.home_team?.name}</p>
                    <p className="text-5xl font-bold text-orange-600">
                      {scoreData.home_q1 + scoreData.home_q2 + scoreData.home_q3 + scoreData.home_q4 + scoreData.home_ot + scoreData.home_ot2}
                    </p>
                  </div>
                  <div className="text-3xl text-gray-400 font-bold">-</div>
                  <div className="text-center">
                    <p className="text-sm text-gray-700 mb-2 font-medium">{selectedMatch.away_team?.name}</p>
                    <p className="text-5xl font-bold text-orange-600">
                      {scoreData.away_q1 + scoreData.away_q2 + scoreData.away_q3 + scoreData.away_q4 + scoreData.away_ot + scoreData.away_ot2}
                    </p>
                  </div>
                </div>
              </div>

              {/* Winning Team */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Winning Team *
                </label>
                <select
                  required
                  value={scoreData.winning_team_id}
                  onChange={(e) => setScoreData({ ...scoreData, winning_team_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                >
                  <option value="">Select Winner</option>
                  <option value={selectedMatch.home_team_id}>{selectedMatch.home_team?.name}</option>
                  <option value={selectedMatch.away_team_id}>{selectedMatch.away_team?.name}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={backToMatchList}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Score & Continue to Stats
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Player Stats Recording View
  if (recordingView === 'stats') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={backToMatchList}
            className="mb-6 text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Back to Matches
          </button>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Player Match Statistics</h2>
              <p className="text-lg font-semibold text-gray-700">
                {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(selectedMatch.match_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <form onSubmit={handleStatsSubmit}>
              <div className="space-y-8">
                {/* Home Team Players */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 bg-orange-50 p-3 rounded-lg">
                    {selectedMatch.home_team?.name}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left text-gray-900 font-semibold border">Player</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">MIN</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">PTS</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">REB</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">AST</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">STL</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">BLK</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">TO</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">PF</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">FG</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">3PT</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">FT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerStatsData
                          .map((stat, idx) => ({ stat, idx, player: players.find(p => p.id === stat.player_id) }))
                          .filter(({ player }) => player?.team_id === selectedMatch.home_team_id)
                          .map(({ stat, idx, player }) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900 border">
                                {player ? `${player.first_name} ${player.last_name} #${player.jersey_number}` : 'Unknown'}
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.minutes_played} onChange={(e) => updatePlayerStat(idx, 'minutes_played', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.points} onChange={(e) => updatePlayerStat(idx, 'points', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.rebounds} onChange={(e) => updatePlayerStat(idx, 'rebounds', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.assists} onChange={(e) => updatePlayerStat(idx, 'assists', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.steals} onChange={(e) => updatePlayerStat(idx, 'steals', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.blocks} onChange={(e) => updatePlayerStat(idx, 'blocks', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.turnovers} onChange={(e) => updatePlayerStat(idx, 'turnovers', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.fouls} onChange={(e) => updatePlayerStat(idx, 'fouls', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <div className="flex gap-1 items-center text-gray-900">
                                  <input type="number" min="0" value={stat.field_goals_made} onChange={(e) => updatePlayerStat(idx, 'field_goals_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.field_goals_attempted} onChange={(e) => updatePlayerStat(idx, 'field_goals_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                              </td>
                              <td className="px-2 py-2 border">
                                <div className="flex gap-1 items-center text-gray-900">
                                  <input type="number" min="0" value={stat.three_pointers_made} onChange={(e) => updatePlayerStat(idx, 'three_pointers_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.three_pointers_attempted} onChange={(e) => updatePlayerStat(idx, 'three_pointers_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                              </td>
                              <td className="px-2 py-2 border">
                                <div className="flex gap-1 items-center text-gray-900">
                                  <input type="number" min="0" value={stat.free_throws_made} onChange={(e) => updatePlayerStat(idx, 'free_throws_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.free_throws_attempted} onChange={(e) => updatePlayerStat(idx, 'free_throws_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
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
                  <h3 className="text-xl font-bold mb-4 text-gray-900 bg-blue-50 p-3 rounded-lg">
                    {selectedMatch.away_team?.name}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left text-gray-900 font-semibold border">Player</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">MIN</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">PTS</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">REB</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">AST</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">STL</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">BLK</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">TO</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">PF</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">FG</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">3PT</th>
                          <th className="px-2 py-3 text-center text-gray-900 font-semibold border">FT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerStatsData
                          .map((stat, idx) => ({ stat, idx, player: players.find(p => p.id === stat.player_id) }))
                          .filter(({ player }) => player?.team_id === selectedMatch.away_team_id)
                          .map(({ stat, idx, player }) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900 border">
                                {player ? `${player.first_name} ${player.last_name} #${player.jersey_number}` : 'Unknown'}
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.minutes_played} onChange={(e) => updatePlayerStat(idx, 'minutes_played', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.points} onChange={(e) => updatePlayerStat(idx, 'points', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.rebounds} onChange={(e) => updatePlayerStat(idx, 'rebounds', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.assists} onChange={(e) => updatePlayerStat(idx, 'assists', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.steals} onChange={(e) => updatePlayerStat(idx, 'steals', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.blocks} onChange={(e) => updatePlayerStat(idx, 'blocks', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.turnovers} onChange={(e) => updatePlayerStat(idx, 'turnovers', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <input type="number" min="0" value={stat.fouls} onChange={(e) => updatePlayerStat(idx, 'fouls', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                              </td>
                              <td className="px-2 py-2 border">
                                <div className="flex gap-1 items-center text-gray-900">
                                  <input type="number" min="0" value={stat.field_goals_made} onChange={(e) => updatePlayerStat(idx, 'field_goals_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.field_goals_attempted} onChange={(e) => updatePlayerStat(idx, 'field_goals_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                              </td>
                              <td className="px-2 py-2 border">
                                <div className="flex gap-1 items-center text-gray-900">
                                  <input type="number" min="0" value={stat.three_pointers_made} onChange={(e) => updatePlayerStat(idx, 'three_pointers_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.three_pointers_attempted} onChange={(e) => updatePlayerStat(idx, 'three_pointers_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                              </td>
                              <td className="px-2 py-2 border">
                                <div className="flex gap-1 items-center text-gray-900">
                                  <input type="number" min="0" value={stat.free_throws_made} onChange={(e) => updatePlayerStat(idx, 'free_throws_made', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                  <span>/</span>
                                  <input type="number" min="0" value={stat.free_throws_attempted} onChange={(e) => updatePlayerStat(idx, 'free_throws_attempted', parseInt(e.target.value) || 0)} className="w-12 px-1 py-1 border rounded text-center text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-orange-500" />
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={backToMatchList}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Player Stats
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
}