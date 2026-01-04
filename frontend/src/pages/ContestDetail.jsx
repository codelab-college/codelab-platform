import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getContest } from '../services/api';
import { 
  ArrowLeft, Trophy, Calendar, Clock, FileText, CheckCircle, 
  ChevronRight, Users, Zap, Timer, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContestDetail = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    try {
      const response = await getContest(id);
      setContest(response.data.contest);
      setProblems(response.data.problems);
    } catch (error) {
      toast.error('Failed to load contest');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-[#00b8a3]',
      medium: 'text-[#ffc01e]',
      hard: 'text-[#ff375f]',
    };
    return colors[difficulty] || 'text-gray-400';
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { class: 'bg-blue-500/20 text-blue-400', text: 'Upcoming', icon: Timer },
      active: { class: 'bg-[#00b8a3]/20 text-[#00b8a3]', text: 'Live Now', icon: Zap },
      completed: { class: 'bg-gray-700 text-gray-400', text: 'Ended', icon: Clock },
    };
    return badges[status] || badges.upcoming;
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

  const statusBadge = getStatusBadge(contest.status);
  const StatusIcon = statusBadge.icon;

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          to="/contests"
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contests
        </Link>

        {/* Contest Header */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.class}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusBadge.text}
                </div>
                {contest.status === 'active' && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[#00b8a3] rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {contest.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">{contest.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Start Time</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">
                    {new Date(contest.start_time).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Duration</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{contest.duration_minutes} min</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Problems</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{problems.length}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Participants</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{contest.participant_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to={`/contests/${id}/leaderboard`}
                className="px-6 py-3 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                Leaderboard
              </Link>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[#3e3e3e] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#ffa116]" />
              Problems
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {problems.filter(p => p.is_solved).length}/{problems.length} Solved
            </span>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-[#3e3e3e]">
            {problems.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No problems available yet</p>
              </div>
            ) : (
              problems.map((problem, index) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/50 transition-colors block"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      problem.is_solved 
                        ? 'bg-[#00b8a3]/20' 
                        : 'bg-gray-100 dark:bg-[#3e3e3e]'
                    }`}>
                      {problem.is_solved ? (
                        <CheckCircle className="w-4 h-4 text-[#00b8a3]" />
                      ) : (
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-medium hover:text-[#ffa116] transition-colors">
                        {index + 1}. {problem.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{problem.marks} points</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {problem.is_solved && (
                      <span className="text-sm text-[#00b8a3] font-medium">Solved</span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContestDetail;
