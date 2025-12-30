import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getContestLeaderboard } from '../services/api';
import { 
  ArrowLeft, Trophy, Medal, Crown, RefreshCw, 
  Clock, ChevronUp, ChevronDown, Minus, User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchLeaderboard = async () => {
    try {
      const response = await getContestLeaderboard(id);
      setLeaderboard(response.data.leaderboard);
      setContest(response.data.contest);
      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Crown className="w-5 h-5 text-white" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-400/30">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-lg shadow-amber-600/30">
            <Medal className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-[#3e3e3e] rounded-full flex items-center justify-center">
            <span className="text-gray-400 font-bold">{rank}</span>
          </div>
        );
    }
  };

  const getRankChange = (change) => {
    if (!change || change === 0) {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
    if (change > 0) {
      return (
        <div className="flex items-center gap-0.5 text-[#00b8a3]">
          <ChevronUp className="w-4 h-4" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-0.5 text-[#ff375f]">
        <ChevronDown className="w-4 h-4" />
        <span className="text-xs font-medium">{Math.abs(change)}</span>
      </div>
    );
  };

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
        <Link
          to={`/contests/${id}`}
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contest
        </Link>

        {/* Header */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ffa116]/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#ffa116]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                <p className="text-gray-400">{contest?.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <button
                onClick={fetchLeaderboard}
                className="p-2 bg-[#3e3e3e] hover:bg-[#4e4e4e] rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Podium (Top 3) */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Second Place */}
            <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6 text-center order-1">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full shadow-lg shadow-gray-400/30">
                <Medal className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-400 mb-2">2nd</div>
              <div className="text-white font-semibold truncate">{leaderboard[1]?.username}</div>
              <div className="text-[#ffa116] font-bold text-xl mt-2">{leaderboard[1]?.total_score}</div>
              <div className="text-gray-500 text-sm">points</div>
            </div>

            {/* First Place */}
            <div className="bg-gradient-to-b from-[#282828] to-[#1a1a1a] border border-[#ffa116]/50 rounded-xl p-6 text-center order-0 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ffa116] text-black text-xs font-bold rounded-full">
                WINNER
              </div>
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/30">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#ffa116] mb-2">1st</div>
              <div className="text-white font-semibold text-lg truncate">{leaderboard[0]?.username}</div>
              <div className="text-[#ffa116] font-bold text-2xl mt-2">{leaderboard[0]?.total_score}</div>
              <div className="text-gray-500 text-sm">points</div>
            </div>

            {/* Third Place */}
            <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6 text-center order-2">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-lg shadow-amber-600/30">
                <Medal className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-amber-600 mb-2">3rd</div>
              <div className="text-white font-semibold truncate">{leaderboard[2]?.username}</div>
              <div className="text-[#ffa116] font-bold text-xl mt-2">{leaderboard[2]?.total_score}</div>
              <div className="text-gray-500 text-sm">points</div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#3e3e3e]">
            <h2 className="text-lg font-semibold text-white">All Rankings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Problems Solved
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e3e3e]">
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <User className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400">No participants yet</p>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, index) => (
                    <tr 
                      key={entry.user_id || index}
                      className={`hover:bg-[#3e3e3e]/50 transition-colors ${
                        index < 3 ? 'bg-[#1a1a1a]/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getRankIcon(index + 1)}
                          {getRankChange(entry.rank_change)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#ffa116]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#ffa116] font-semibold">
                              {entry.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white font-medium">{entry.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[#00b8a3] font-semibold">{entry.problems_solved || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-bold text-lg">{entry.total_score || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-400">{entry.total_time || '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
