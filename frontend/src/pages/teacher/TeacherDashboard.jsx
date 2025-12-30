import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Trophy, 
  FileText, 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp 
} from 'lucide-react';
import { teacherAPI } from '../../services/teacherApi';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await teacherAPI.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentSubmissions = data?.recentSubmissions || [];
  const assignmentStats = data?.assignmentStats || [];

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-gray-400">Manage your assignments and track student progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-[#ffa116]/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-[#ffa116]" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Assignments</h3>
            <p className="text-3xl font-bold text-white">{stats.totalAssignments || 0}</p>
          </div>

          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Active Assignments</h3>
            <p className="text-3xl font-bold text-white">{stats.activeAssignments || 0}</p>
          </div>

          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Problems</h3>
            <p className="text-3xl font-bold text-white">{stats.totalProblems || 0}</p>
          </div>

          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Submissions</h3>
            <p className="text-3xl font-bold text-white">{stats.totalSubmissions || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/teacher/assignments/create"
            className="bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-xl p-6 transition-colors"
          >
            <BookOpen className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">Create Assignment</h3>
            <p className="text-sm opacity-80">Create a new assignment for students</p>
          </Link>

          <Link
            to="/teacher/contests/create"
            className="bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white font-semibold rounded-xl p-6 transition-colors"
          >
            <Trophy className="w-8 h-8 mb-3 text-[#ffa116]" />
            <h3 className="text-lg font-bold mb-1">Create Contest</h3>
            <p className="text-sm text-gray-400">Schedule a coding contest</p>
          </Link>

          <Link
            to="/teacher/students"
            className="bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white font-semibold rounded-xl p-6 transition-colors"
          >
            <Users className="w-8 h-8 mb-3 text-[#ffa116]" />
            <h3 className="text-lg font-bold mb-1">Student Search</h3>
            <p className="text-sm text-gray-400">Search and view student profiles</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Submissions</h2>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <p className="text-gray-400 text-sm">No submissions yet</p>
              ) : (
                recentSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{sub.student_name}</p>
                        <span className="text-xs text-gray-500">{sub.usn}</span>
                      </div>
                      <p className="text-sm text-gray-400">{sub.problem_title}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                          sub.verdict === 'AC'
                            ? 'bg-green-500/20 text-green-400'
                            : sub.verdict === 'WA'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {sub.verdict}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(sub.submitted_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assignment Stats */}
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Assignment Overview</h2>
              <Link
                to="/teacher/assignments"
                className="text-sm text-[#ffa116] hover:text-[#ffb84d]"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {assignmentStats.length === 0 ? (
                <p className="text-gray-400 text-sm">No assignments created yet</p>
              ) : (
                assignmentStats.map((assignment) => (
                  <Link
                    key={assignment.id}
                    to={`/teacher/assignments/${assignment.id}`}
                    className="block p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#252525] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{assignment.title}</h3>
                      {assignment.is_closed ? (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                          Closed
                        </span>
                      ) : (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{assignment.students_submitted || 0} submissions</span>
                      <span>
                        Avg: {assignment.average_score ? assignment.average_score.toFixed(1) : '0'}%
                      </span>
                      {assignment.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
