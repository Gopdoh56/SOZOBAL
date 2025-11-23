'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/Client';
import { Calendar, MapPin, Users, Trophy, TrendingUp, Award } from 'lucide-react';

import NbaHeader from '@/components/nba-header';

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  venue_id: string;
  match_date: string;
  round_number: number;
  home_score: number;
  away_score: number;
  status: string;
  attendance: number;
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
}

interface PlayerStat {
  player_id: string;
  team_id: string;
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
  player?: {
    first_name: string;
    last_name: string;
    jersey_number: number;
    position: string;
  };
}

function BoxScorePage({ matchId }: { matchId: string }) {
  const [match, setMatch] = useState<Match | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [homeTeamStats, setHomeTeamStats] = useState<PlayerStat[]>([]);
  const [awayTeamStats, setAwayTeamStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoxScore();
  }, [matchId]);

  const loadBoxScore = async () => {
    const supabase = createClient();

    // Load match details
    const { data: matchData } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(name, logo_url),
        away_team:teams!matches_away_team_id_fkey(name, logo_url),
        venue:venues(name),
        division:divisions(name)
      `)
      .eq('id', matchId)
      .single();

    // Load score breakdown
    const { data: scoreData } = await supabase
      .from('match_scores')
      .select('*')
      .eq('match_id', matchId)
      .single();

    // Load player stats
    const { data: statsData } = await supabase
      .from('player_match_stats')
      .select(`
        *,
        player:players(first_name, last_name, jersey_number, position)
      `)
      .eq('match_id', matchId)
      .order('points', { ascending: false });

    if (matchData) {
      setMatch(matchData);
      
      // Separate stats by team using team_id
      const homeStats = statsData?.filter(s => s.team_id === matchData.home_team_id) || [];
      const awayStats = statsData?.filter(s => s.team_id === matchData.away_team_id) || [];
      
      setHomeTeamStats(homeStats);
      setAwayTeamStats(awayStats);
    }

    if (scoreData) setScoreBreakdown(scoreData);
    setLoading(false);
  };

  const calculateTeamTotals = (stats: PlayerStat[]) => {
    return stats.reduce((totals, stat) => ({
      points: totals.points + stat.points,
      rebounds: totals.rebounds + stat.rebounds,
      assists: totals.assists + stat.assists,
      steals: totals.steals + stat.steals,
      blocks: totals.blocks + stat.blocks,
      turnovers: totals.turnovers + stat.turnovers,
      fouls: totals.fouls + stat.fouls,
      fgm: totals.fgm + stat.field_goals_made,
      fga: totals.fga + stat.field_goals_attempted,
      tpm: totals.tpm + stat.three_pointers_made,
      tpa: totals.tpa + stat.three_pointers_attempted,
      ftm: totals.ftm + stat.free_throws_made,
      fta: totals.fta + stat.free_throws_attempted,
    }), {
      points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0,
      turnovers: 0, fouls: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0
    });
  };

  const getTopPerformers = () => {
    const allStats = [...homeTeamStats, ...awayTeamStats];
    return {
      points: allStats.reduce((max, s) => s.points > max.points ? s : max, allStats[0]),
      rebounds: allStats.reduce((max, s) => s.rebounds > max.rebounds ? s : max, allStats[0]),
      assists: allStats.reduce((max, s) => s.assists > max.assists ? s : max, allStats[0]),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-black">Match not found</p>
      </div>
    );
  }

  const topPerformers = homeTeamStats.length > 0 ? getTopPerformers() : null;
  const homeTotals = calculateTeamTotals(homeTeamStats);
  const awayTotals = calculateTeamTotals(awayTeamStats);

  return (
    <>
      <NbaHeader />
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Match Header */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white" />
                <span className="font-medium text-white">
                  {new Date(match.match_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-6">
                {match.venue?.name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-white" />
                    <span className="text-white">{match.venue.name}</span>
                  </div>
                )}
                {match.attendance > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-white" />
                    <span className="text-white">{match.attendance.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Home Team */}
              <div className="text-center">
                {match.home_team?.logo_url ? (
                  <img 
                    src={match.home_team.logo_url} 
                    alt={match.home_team.name}
                    className="w-24 h-24 mx-auto mb-4 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-4xl font-bold">{match.home_team?.name[0]}</span>
                  </div>
                )}
                <h2 className="text-2xl font-bold">{match.home_team?.name}</h2>
              </div>

              {/* Score */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-6">
                  <div className={`text-6xl font-bold ${match.home_score > match.away_score ? 'text-yellow-300' : ''}`}>
                    {match.home_score}
                  </div>
                  <div className="text-3xl text-white/60">-</div>
                  <div className={`text-6xl font-bold ${match.away_score > match.home_score ? 'text-yellow-300' : ''}`}>
                    {match.away_score}
                  </div>
                </div>
                <div className="mt-4 text-sm uppercase tracking-wider text-white">
                  {match.status === 'completed' ? 'Final' : match.status}
                </div>
              </div>

              {/* Away Team */}
              <div className="text-center">
                {match.away_team?.logo_url ? (
                  <img 
                    src={match.away_team.logo_url} 
                    alt={match.away_team.name}
                    className="w-24 h-24 mx-auto mb-4 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-4xl font-bold">{match.away_team?.name[0]}</span>
                  </div>
                )}
                <h2 className="text-2xl font-bold">{match.away_team?.name}</h2>
              </div>
            </div>
          </div>

          {/* Quarter by Quarter Scores */}
          {scoreBreakdown && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Score Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-900 font-semibold">Team</th>
                      <th className="text-center py-3 px-4 text-gray-900 font-semibold">Q1</th>
                      <th className="text-center py-3 px-4 text-gray-900 font-semibold">Q2</th>
                      <th className="text-center py-3 px-4 text-gray-900 font-semibold">Q3</th>
                      <th className="text-center py-3 px-4 text-gray-900 font-semibold">Q4</th>
                      {(scoreBreakdown.home_ot > 0 || scoreBreakdown.away_ot > 0) && (
                        <th className="text-center py-3 px-4 text-gray-900 font-semibold">OT</th>
                      )}
                      {(scoreBreakdown.home_ot2 > 0 || scoreBreakdown.away_ot2 > 0) && (
                        <th className="text-center py-3 px-4 text-gray-900 font-semibold">OT2</th>
                      )}
                      <th className="text-center py-3 px-4 text-gray-900 font-bold bg-orange-50">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-semibold text-gray-900">{match.home_team?.name}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.home_q1}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.home_q2}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.home_q3}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.home_q4}</td>
                      {(scoreBreakdown.home_ot > 0 || scoreBreakdown.away_ot > 0) && (
                        <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.home_ot}</td>
                      )}
                      {(scoreBreakdown.home_ot2 > 0 || scoreBreakdown.away_ot2 > 0) && (
                        <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.home_ot2}</td>
                      )}
                      <td className="text-center py-3 px-4 font-bold text-gray-900 bg-orange-50">{match.home_score}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900">{match.away_team?.name}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.away_q1}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.away_q2}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.away_q3}</td>
                      <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.away_q4}</td>
                      {(scoreBreakdown.home_ot > 0 || scoreBreakdown.away_ot > 0) && (
                        <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.away_ot}</td>
                      )}
                      {(scoreBreakdown.home_ot2 > 0 || scoreBreakdown.away_ot2 > 0) && (
                        <td className="text-center py-3 px-4 text-gray-900">{scoreBreakdown.away_ot2}</td>
                      )}
                      <td className="text-center py-3 px-4 font-bold text-gray-900 bg-orange-50">{match.away_score}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Performers */}
          {topPerformers && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-bold text-gray-900">Top Scorer</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{topPerformers.points?.player?.first_name} {topPerformers.points?.player?.last_name}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{topPerformers.points?.points} PTS</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-gray-900">Top Rebounder</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{topPerformers.rebounds?.player?.first_name} {topPerformers.rebounds?.player?.last_name}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{topPerformers.rebounds?.rebounds} REB</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-gray-900">Top Assists</h4>
                </div>
                <p className="text-2xl font-bold text-gray-900">{topPerformers.assists?.player?.first_name} {topPerformers.assists?.player?.last_name}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{topPerformers.assists?.assists} AST</p>
              </div>
            </div>
          )}

          {/* Home Team Stats */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-orange-600 text-white px-6 py-4">
              <h3 className="text-xl font-bold">{match.home_team?.name}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Player</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">MIN</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">PTS</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">REB</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">AST</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">STL</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">BLK</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">TO</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">PF</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">FG</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">3PT</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">FT</th>
                  </tr>
                </thead>
                <tbody>
                  {homeTeamStats.map((stat, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-black">
                        <div className="font-semibold">{stat.player?.first_name} {stat.player?.last_name}</div>
                        <div className="text-xs text-black">#{stat.player?.jersey_number} • {stat.player?.position}</div>
                      </td>
                      <td className="text-center py-3 px-2 text-black">{stat.minutes_played}</td>
                      <td className="text-center py-3 px-2 font-semibold text-black">{stat.points}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.rebounds}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.assists}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.steals}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.blocks}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.turnovers}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.fouls}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.field_goals_made}-{stat.field_goals_attempted}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.three_pointers_made}-{stat.three_pointers_attempted}</td>
                      <td className="text-center py-3 px-2 text-black">{stat.free_throws_made}-{stat.free_throws_attempted}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                    <td className="py-3 px-4 text-black">TEAM TOTALS</td>
                    <td className="text-center py-3 px-2 text-black">-</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.points}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.rebounds}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.assists}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.steals}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.blocks}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.turnovers}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.fouls}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.fgm}-{homeTotals.fga}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.tpm}-{homeTotals.tpa}</td>
                    <td className="text-center py-3 px-2 text-black">{homeTotals.ftm}-{homeTotals.fta}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Away Team Stats */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-4">
              <h3 className="text-xl font-bold">{match.away_team?.name}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Player</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">MIN</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">PTS</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">REB</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">AST</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">STL</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">BLK</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">TO</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">PF</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">FG</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">3PT</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">FT</th>
                  </tr>
                </thead>
                <tbody>
                  {awayTeamStats.map((stat, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        <div className="font-semibold">{stat.player?.first_name} {stat.player?.last_name}</div>
                        <div className="text-xs text-gray-500">#{stat.player?.jersey_number} • {stat.player?.position}</div>
                      </td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.minutes_played}</td>
                      <td className="text-center py-3 px-2 font-semibold text-gray-900">{stat.points}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.rebounds}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.assists}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.steals}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.blocks}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.turnovers}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.fouls}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.field_goals_made}-{stat.field_goals_attempted}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.three_pointers_made}-{stat.three_pointers_attempted}</td>
                      <td className="text-center py-3 px-2 text-gray-900">{stat.free_throws_made}-{stat.free_throws_attempted}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                    <td className="py-3 px-4 text-black">TEAM TOTALS</td>
                    <td className="text-center py-3 px-2 text-black">-</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.points}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.rebounds}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.assists}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.steals}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.blocks}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.turnovers}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.fouls}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.fgm}-{awayTotals.fga}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.tpm}-{awayTotals.tpa}</td>
                    <td className="text-center py-3 px-2 text-black">{awayTotals.ftm}-{awayTotals.fta}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shooting Percentages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team Shooting */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 text-black">{match.home_team?.name} - Shooting Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-black">Field Goal %</span>
                    <span className="text-sm font-bold text-black">
                      {homeTotals.fga > 0 ? ((homeTotals.fgm / homeTotals.fga) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${homeTotals.fga > 0 ? (homeTotals.fgm / homeTotals.fga) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-black">3-Point %</span>
                    <span className="text-sm font-bold text-black">
                      {homeTotals.tpa > 0 ? ((homeTotals.tpm / homeTotals.tpa) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${homeTotals.tpa > 0 ? (homeTotals.tpm / homeTotals.tpa) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-black">Free Throw %</span>
                    <span className="text-sm font-bold text-black">
                      {homeTotals.fta > 0 ? ((homeTotals.ftm / homeTotals.fta) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${homeTotals.fta > 0 ? (homeTotals.ftm / homeTotals.fta) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Away Team Shooting */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 text-black">{match.away_team?.name} - Shooting Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-black">Field Goal %</span>
                    <span className="text-sm font-bold text-black">
                      {awayTotals.fga > 0 ? ((awayTotals.fgm / awayTotals.fga) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${awayTotals.fga > 0 ? (awayTotals.fgm / awayTotals.fga) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-black">3-Point %</span>
                    <span className="text-sm font-bold text-black">
                      {awayTotals.tpa > 0 ? ((awayTotals.tpm / awayTotals.tpa) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${awayTotals.tpa > 0 ? (awayTotals.tpm / awayTotals.tpa) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-black">Free Throw %</span>
                    <span className="text-sm font-bold text-black">
                      {awayTotals.fta > 0 ? ((awayTotals.ftm / awayTotals.fta) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${awayTotals.fta > 0 ? (awayTotals.ftm / awayTotals.fta) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function GameStatsPage({
  searchParams,
}: {
  searchParams: { matchId?: string; id?: string };
}) {
  const matchId = searchParams.matchId || searchParams.id;

  if (!matchId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Match Selected</h1>
          <p className="text-gray-600">Please provide a matchId in the URL parameters.</p>
          <p className="text-sm text-gray-500 mt-4">
            Example: /game_stats?matchId=your-match-id
          </p>
        </div>
      </div>
    );
  }

  return <BoxScorePage matchId={matchId} />;
}