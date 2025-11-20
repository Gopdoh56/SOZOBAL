// app/admin/dashboard/tournaments/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/Client';
import { Plus, Edit, Trash2, Search, X, Trophy } from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  description: string;
  tournament_type: string;
  start_date: string;
  end_date: string;
  location: string;
  prize_pool: number;
  max_teams: number;
  registration_deadline: string;
  status: string;
  created_at: string;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tournament_type: 'knockout',
    start_date: '',
    end_date: '',
    location: '',
    prize_pool: '',
    max_teams: '',
    registration_deadline: '',
    status: 'upcoming',
  });

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: false });

    if (data) setTournaments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const tournamentData = {
      ...formData,
      prize_pool: formData.prize_pool ? parseFloat(formData.prize_pool) : null,
      max_teams: formData.max_teams ? parseInt(formData.max_teams) : null,
    };

    if (editingTournament) {
      const { error } = await supabase
        .from('tournaments')
        .update(tournamentData)
        .eq('id', editingTournament.id);

      if (!error) {
        alert('Tournament updated successfully!');
        loadTournaments();
        closeModal();
      }
    } else {
      const { error } = await supabase
        .from('tournaments')
        .insert([tournamentData]);

      if (!error) {
        alert('Tournament created successfully!');
        loadTournaments();
        closeModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Tournament deleted successfully!');
      loadTournaments();
    }
  };

  const openModal = (tournament?: Tournament) => {
    if (tournament) {
      setEditingTournament(tournament);
      setFormData({
        name: tournament.name,
        description: tournament.description || '',
        tournament_type: tournament.tournament_type || 'knockout',
        start_date: tournament.start_date || '',
        end_date: tournament.end_date || '',
        location: tournament.location || '',
        prize_pool: tournament.prize_pool ? tournament.prize_pool.toString() : '',
        max_teams: tournament.max_teams ? tournament.max_teams.toString() : '',
        registration_deadline: tournament.registration_deadline || '',
        status: tournament.status || 'upcoming',
      });
    } else {
      setEditingTournament(null);
      setFormData({
        name: '',
        description: '',
        tournament_type: 'knockout',
        start_date: '',
        end_date: '',
        location: '',
        prize_pool: '',
        max_teams: '',
        registration_deadline: '',
        status: 'upcoming',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTournament(null);
  };

  const filteredTournaments = tournaments.filter((tournament) =>
    tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-600 mt-1">Manage basketball tournaments and competitions</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Tournament
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tournaments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{tournament.name}</h3>
                  <p className="text-sm text-gray-600">{tournament.tournament_type}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tournament.status)}`}>
                {tournament.status}
              </span>
            </div>

            {tournament.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>
            )}

            <div className="space-y-2 mb-4 text-sm">
              {tournament.location && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{tournament.location}</span>
                </div>
              )}
              {tournament.start_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium">{new Date(tournament.start_date).toLocaleDateString()}</span>
                </div>
              )}
              {tournament.end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">End:</span>
                  <span className="font-medium">{new Date(tournament.end_date).toLocaleDateString()}</span>
                </div>
              )}
              {tournament.max_teams && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Teams:</span>
                  <span className="font-medium">{tournament.max_teams}</span>
                </div>
              )}
              {tournament.prize_pool && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Prize Pool:</span>
                  <span className="font-medium text-green-600">${tournament.prize_pool.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openModal(tournament)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(tournament.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tournaments found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTournament ? 'Edit Tournament' : 'Add New Tournament'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Summer Championship 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the tournament"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Type *
                  </label>
                  <select
                    required
                    value={formData.tournament_type}
                    onChange={(e) => setFormData({ ...formData, tournament_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="knockout">Knockout</option>
                    <option value="round-robin">Round Robin</option>
                    <option value="league">League</option>
                    <option value="playoff">Playoff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., National Sports Arena"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Teams
                  </label>
                  <input
                    type="number"
                    value={formData.max_teams}
                    onChange={(e) => setFormData({ ...formData, max_teams: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="16"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prize Pool ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prize_pool}
                    onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="10000"
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
                  {editingTournament ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}