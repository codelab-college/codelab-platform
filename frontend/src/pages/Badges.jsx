import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getBadges, getBadgeLeaderboard, checkBadges } from '../services/practiceApi';
import { 
  Trophy, Medal, Star, Lock, CheckCircle, 
  Users, Crown, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');
  const [newBadges, setNewBadges] = useState([]);

  useEffect(() => {
    fetchBadges();
    fetchLeaderboard();
    // checkForNewBadges(); // Disabled for now
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await getBadges();
      setBadges(response.data.badges || []);
    } catch (error) {
      toast.error('Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await getBadgeLeaderboard();
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      setLeaderboard([]);
    }
  };

  const checkForNewBadges = async () => {
    try {
      const response = await checkBadges();
      if (response.data.newBadges && response.data.newBadges.length > 0) {
        setNewBadges(response.data.newBadges);
        toast.success(response.data.message || 'New badges earned!', { duration: 5000, icon: '🎉' });
      }
    } catch (error) {
      // Optional - silently fail
    }
  };

  const earnedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-[#ffa116]" />
              Achievements
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Collect badges and climb the leaderboard</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-lg">
              <span className="text-gray-500 dark:text-gray-400">Earned: </span>
              <span className="text-[#ffa116] font-bold">{earnedBadges.length}/{badges.length}</span>
            </div>
          </div>
        </div>

        {/* New Badge Alert */}
        {newBadges.length > 0 && (
          <div className="bg-gradient-to-r from-[#ffa116]/20 to-[#ffc01e]/20 border border-[#ffa116]/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#ffa116]" />
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">New Badge Earned!</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  You earned: {newBadges.map(b => `${b.icon} ${b.name}`).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-[#3e3e3e]">
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'badges'
                ? 'text-[#ffa116] border-b-2 border-[#ffa116]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Badges
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'text-[#ffa116] border-b-2 border-[#ffa116]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === 'badges' ? (
          <div className="space-y-8">
            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#00b8a3]" />
                  Earned ({earnedBadges.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-white dark:bg-[#282828] border border-[#00b8a3]/50 rounded-xl p-5 text-center relative overflow-hidden"
                    >
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-4 h-4 text-[#00b8a3]" />
                      </div>
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">{badge.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{badge.description}</p>
                      {badge.earnedAt && (
                        <p className="text-[#00b8a3] text-xs mt-2">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-500" />
                  Locked ({lockedBadges.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {lockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5 text-center relative opacity-60"
                    >
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="text-4xl mb-3 grayscale">{badge.icon}</div>
                      <h3 className="text-gray-900 dark:text-white font-semibold">{badge.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{badge.description}</p>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="h-1.5 bg-gray-200 dark:bg-[#3e3e3e] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ffa116] rounded-full transition-all"
                            style={{ width: `${Math.min(badge.progress, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(badge.progress)}% complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Leaderboard */
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#1a1a1a]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rank</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Badges</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Collection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#3e3e3e]">
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-12 text-center">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400">No rankings yet</p>
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/30">
                        <td className="px-4 py-4">
                          {index === 0 ? (
                            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                              <Crown className="w-4 h-4 text-yellow-400" />
                            </div>
                          ) : index === 1 ? (
                            <div className="w-8 h-8 bg-gray-400/20 rounded-full flex items-center justify-center">
                              <Medal className="w-4 h-4 text-gray-300" />
                            </div>
                          ) : index === 2 ? (
                            <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center">
                              <Medal className="w-4 h-4 text-amber-500" />
                            </div>
                          ) : (
                            <span className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                              {index + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#ffa116]/20 rounded-full flex items-center justify-center">
                              <span className="text-[#ffa116] font-semibold">
                                {entry.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">{entry.name}</p>
                              <p className="text-gray-500 text-xs">{entry.usn}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="px-3 py-1 bg-[#ffa116]/20 text-[#ffa116] rounded-full font-bold">
                            {entry.badge_count}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1">
                            {entry.badges?.slice(0, 6).map((badge, i) => (
                              <span key={i} className="text-lg" title={badge.name}>
                                {badge.icon}
                              </span>
                            ))}
                            {entry.badges?.length > 6 && (
                              <span className="text-gray-500 text-sm">+{entry.badges.length - 6}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Badges;
