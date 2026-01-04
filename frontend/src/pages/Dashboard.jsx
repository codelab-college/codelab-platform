import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getDashboard } from '../services/api';
import { 
  FileText, Trophy, Code, TrendingUp, Calendar, User, 
  CheckCircle, Clock, Target, Award, BookOpen, PlayCircle,
  ChevronRight, Flame, Zap, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboard();
      setData(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      not_started: 'bg-gray-700 text-gray-300',
      in_progress: 'bg-[#ffa116]/20 text-[#ffa116]',
      submitted: 'bg-[#00b8a3]/20 text-[#00b8a3]',
    };
    return badges[status] || 'bg-gray-700 text-gray-300';
  };

  const getVerdictBadge = (verdict) => {
    const badges = {
      AC: 'text-[#00b8a3]',
      WA: 'text-[#ff375f]',
      TLE: 'text-[#ffc01e]',
      RE: 'text-[#ff375f]',
    };
    return badges[verdict] || 'text-gray-400';
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
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-[#ffa116]/20 to-[#ff6b00]/10 border border-[#ffa116]/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome back, {data?.user?.name?.split(' ')[0] || 'Coder'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress, solve problems, and compete in contests
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-[#282828] border border-gray-200 dark:border-transparent rounded-lg px-4 py-2">
              <Flame className="w-5 h-5 text-[#ffa116]" />
              <span className="text-gray-900 dark:text-white font-medium">0 day streak</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Problems Solved */}
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5 hover:border-gray-300 dark:hover:border-[#4a4a4a] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Problems Solved</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data?.stats?.problemsSolved || 0}
                </p>
                <p className="text-xs text-[#00b8a3] mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Keep going!
                </p>
              </div>
              <div className="w-12 h-12 bg-[#00b8a3]/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#00b8a3]" />
              </div>
            </div>
          </div>

          {/* Assignments */}
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5 hover:border-gray-300 dark:hover:border-[#4a4a4a] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assignments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data?.stats?.assignmentsAttempted || 0}
                </p>
                <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Attempted
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Submissions */}
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5 hover:border-gray-300 dark:hover:border-[#4a4a4a] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submissions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data?.stats?.totalSubmissions || 0}
                </p>
                <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  Total attempts
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5 hover:border-gray-300 dark:hover:border-[#4a4a4a] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data?.stats?.avgScore || 0}%
                </p>
                <p className="text-xs text-[#ffa116] mt-2 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Performance
                </p>
              </div>
              <div className="w-12 h-12 bg-[#ffa116]/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#ffa116]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Assignments */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-[#3e3e3e] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#ffa116]" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Assignments</h2>
                </div>
                <Link to="/assignments" className="text-sm text-[#ffa116] hover:text-[#ffb84d] font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-[#3e3e3e]">
                {data?.activeAssignments?.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">No active assignments</p>
                  </div>
                ) : (
                  data?.activeAssignments?.map((assignment) => (
                    <Link
                      key={assignment.id}
                      to={`/assignments/${assignment.id}`}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate mb-2">
                            {assignment.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {assignment.teacher_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {assignment.problem_count} problems
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(assignment.status)}`}>
                            {assignment.status?.replace('_', ' ')}
                          </span>
                          {assignment.score !== null && (
                            <span className="text-lg font-bold text-[#ffa116]">
                              {assignment.score}/{assignment.total_marks}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Contests */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-[#3e3e3e] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#ffc01e]" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contests</h2>
                </div>
                <Link to="/contests" className="text-sm text-[#ffa116] hover:text-[#ffb84d] font-medium flex items-center gap-1">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-[#3e3e3e]">
                {data?.upcomingContests?.length === 0 ? (
                  <div className="p-8 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No upcoming contests</p>
                  </div>
                ) : (
                  data?.upcomingContests?.map((contest) => (
                    <Link
                      key={contest.id}
                      to={`/contests/${contest.id}`}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {contest.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          {contest.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {contest.problem_count} problems
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(contest.start_time).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[#3e3e3e] flex items-center gap-2">
            <Code className="w-5 h-5 text-[#ffa116]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Submissions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#3e3e3e]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Verdict
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3e3e3e]">
                {data?.recentSubmissions?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Code className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start solving problems to see your submissions here</p>
                    </td>
                  </tr>
                ) : (
                  data?.recentSubmissions?.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/submissions/${submission.id}`}
                          className="text-[#ffa116] hover:text-[#ffb84d] font-medium"
                        >
                          {submission.problem_title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{submission.assignment_title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${getVerdictBadge(submission.verdict)}`}>
                          {submission.verdict}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{submission.score}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </span>
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

export default Dashboard;
