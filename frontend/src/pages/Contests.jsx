import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getContests } from '../services/api';
import { Trophy, Calendar, Clock, FileText, Users, ChevronRight, Zap, Timer } from 'lucide-react';
import toast from 'react-hot-toast';

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await getContests();
      setContests(response.data.contests);
    } catch (error) {
      toast.error('Failed to load contests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { class: 'bg-blue-500/20 text-blue-400', text: 'Upcoming', icon: Timer },
      active: { class: 'bg-[#00b8a3]/20 text-[#00b8a3]', text: 'Live', icon: Zap },
      completed: { class: 'bg-gray-700 text-gray-400', text: 'Ended', icon: Clock },
    };
    return badges[status] || badges.upcoming;
  };

  const filteredContests = contests.filter((contest) => {
    if (filter === 'all') return true;
    return contest.status === filter;
  });

  const filterButtons = [
    { id: 'all', label: 'All Contests' },
    { id: 'active', label: 'Live' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Past' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa116]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-[#ffc01e]" />
              Contests
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Participate in coding contests and compete with others</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === btn.id
                  ? 'bg-[#ffa116] text-black'
                  : 'bg-white dark:bg-[#282828] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3e3e3e] border border-gray-200 dark:border-[#3e3e3e]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Contests List */}
        {filteredContests.length === 0 ? (
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contests available</h3>
            <p className="text-gray-500 dark:text-gray-400">Check back later for upcoming contests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live Contests Banner */}
            {filter === 'all' && contests.some(c => c.status === 'active') && (
              <div className="bg-gradient-to-r from-[#00b8a3]/20 to-[#00d9c4]/10 border border-[#00b8a3]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#00b8a3] rounded-full animate-pulse"></div>
                  <span className="text-[#00b8a3] font-medium">Live Contests</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Active contests are happening now. Join before they end!</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredContests.map((contest) => {
                const statusBadge = getStatusBadge(contest.status);
                const StatusIcon = statusBadge.icon;
                const startDate = new Date(contest.start_time);
                const endDate = new Date(contest.end_time);

                return (
                  <Link
                    key={contest.id}
                    to={`/contests/${contest.id}`}
                    className={`bg-white dark:bg-[#282828] border rounded-xl p-5 hover:bg-gray-50 dark:hover:bg-[#2d2d2d] transition-all group ${
                      contest.status === 'active' 
                        ? 'border-[#00b8a3]/50 hover:border-[#00b8a3]' 
                        : 'border-gray-200 dark:border-[#3e3e3e] hover:border-gray-300 dark:hover:border-[#4a4a4a]'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.text}
                      </div>
                      {contest.status === 'active' && (
                        <div className="flex items-center gap-1 text-[#00b8a3] text-xs">
                          <div className="w-1.5 h-1.5 bg-[#00b8a3] rounded-full animate-pulse"></div>
                          Live
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-[#ffa116] transition-colors line-clamp-1">
                      {contest.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {contest.description || 'No description provided'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {contest.problem_count}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Problems</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {contest.duration_minutes}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Minutes</div>
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="space-y-2 text-sm border-t border-gray-200 dark:border-[#3e3e3e] pt-4">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Start: {startDate.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>End: {endDate.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="mt-4 flex items-center justify-end text-[#ffa116] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {contest.status === 'active' ? 'Join Now' : 'View Details'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#ffa116]" />
            Contest Rules
          </h3>
          <ul className="space-y-3 text-gray-500 dark:text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              Contests have a fixed duration. Complete as many problems as possible within the time limit.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              Your score is based on the number of problems solved and the time taken.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              Rankings are updated in real-time on the leaderboard.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              You can submit multiple times, but only your best score counts.
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Contests;
