// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Trophy,
  Calendar,
  Building2,
  TrendingUp,
  Activity,
  MapPin,
  Newspaper
} from 'lucide-react';

interface Stats {
  divisions: number;
  teams: number;
  players: number;
  matches: number;
  upcomingMatches: number;
  tournaments: number;
  venues: number;
  news: number;
}

interface RecentMatch {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  match_date: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    divisions: 0,
    teams: 0,
    players: 0,
    matches: 0,
    upcomingMatches: 0,
    tournaments: 0,
    venues: 0,
    news: 0,
  });
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const supabase = createClient();

    try {
      // Get all stats in parallel
      const [
        divisionsData,
        teamsData,
        playersData,
        matchesData,
        upcomingData,
        tournamentsData,
        venuesData,
        newsData,
        recentMatchesData,
      ] = await Promise.all([
        supabase.from('divisions').select('id', { count: 'exact', head: true }),
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'scheduled').gte('match_date', new Date().toISOString()),
        supabase.from('tournaments').select('id', { count: 'exact', head: true }),
        supabase.from('venues').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase
          .from('matches')
          .select(`
            id,
            home_score,
            away_score,
            match_date,
            status,
            home_team:teams!matches_home_team_id_fkey(name),
            away_team:teams!matches_away_team_id_fkey(name)
          `)
          .eq('status', 'completed')
          .order('match_date', { ascending: false })
          .limit(5),
      ]);

      setStats({
        divisions: divisionsData.count || 0,
        teams: teamsData.count || 0,
        players: playersData.count || 0,
        matches: matchesData.count || 0,
        upcomingMatches: upcomingData.count || 0,
        tournaments: tournamentsData.count || 0,
        venues: venuesData.count || 0,
        news: newsData.count || 0,
      });

      if (recentMatchesData.data) {
        setRecentMatches(
          recentMatchesData.data.map((match: any) => ({
            id: match.id,
            home_team: match.home_team?.name || 'TBA',
            away_team: match.away_team?.name || 'TBA',
            home_score: match.home_score,
            away_score: match.away_score,
            match_date: match.match_date,
            status: match.status,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Divisions', value: stats.divisions, icon: Building2, color: 'bg-blue-500', change: null },
    { name: 'Teams', value: stats.teams, icon: Users, color: 'bg-green-500', change: null },
    { name: 'Players', value: stats.players, icon: Activity, color: 'bg-purple-500', change: null },
    { name: 'Total Matches', value: stats.matches, icon: Calendar, color: 'bg-orange-500', change: null },
    { name: 'Upcoming Matches', value: stats.upcomingMatches, icon: Calendar, color: 'bg-red-500', change: null },
    { name: 'Tournaments', value: stats.tournaments, icon: Trophy, color: 'bg-yellow-500', change: null },
    { name: 'Venues', value: stats.venues, icon: MapPin, color: 'bg-indigo-500', change: null },
    { name: 'News Articles', value: stats.news, icon: Newspaper, color: 'bg-pink-500', change: null },
  ];

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to your Basketball League management panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Matches</h2>
        </div>
        <div className="p-6">
          {recentMatches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No completed matches yet</p>
          ) : (
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900">{match.home_team}</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {match.home_score}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 text-gray-400 font-medium">vs</div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {match.away_score}
                      </span>
                      <span className="font-medium text-gray-900">{match.away_team}</span>
                    </div>
                  </div>
                  <div className="ml-6 text-sm text-gray-500">
                    {new Date(match.match_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickActionCard
          title="Create Match"
          description="Schedule a new match"
          icon={Calendar}
          color="bg-orange-500"
        />
        <QuickActionCard
          title="Add Team"
          description="Register a new team"
          icon={Users}
          color="bg-green-500"
        />
        <QuickActionCard
          title="Create Tournament"
          description="Set up a new tournament"
          icon={Trophy}
          color="bg-yellow-500"
        />
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}