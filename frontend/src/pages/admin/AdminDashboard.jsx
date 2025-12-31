import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getAdminDashboard } from '../../services/adminApi';
import { 
  Users, GraduationCap, FileText, CheckCircle, 
  TrendingUp, Activity, Clock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getAdminDashboard();
      setStats(response.data.stats);
      setRecentSubmissions(response.data.recentSubmissions);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict) => {
    const badges = {
      AC: { class: 'bg-[#00b8a3]/20 text-[#00b8a3]', label: 'Accepted' },
      WA: { class: 'bg-[#ff375f]/20 text-[#ff375f]', label: 'Wrong Answer' },
      TLE: { class: 'bg-[#ffc01e]/20 text-[#ffc01e]', label: 'Time Limit' },
      RE: { class: 'bg-purple-500/20 text-purple-400', label: 'Runtime Error' },
    };
    return badges[verdict] || { class: 'bg-gray-500/20 text-gray-400', label: verdict };
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff375f]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Teachers</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.teachers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Students</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.students || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#00b8a3]/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00b8a3]" />
              </div>
            </div>
          </div>

          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Assignments</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.assignments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#ffa116]/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#ffa116]" />
              </div>
            </div>
          </div>

          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Problems</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.problems || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Submissions</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.submissions || 0}</p>
              </div>
              <div className="w-12 h-12 bg-[#ff375f]/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#ff375f]" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#3e3e3e] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ff375f]" />
              Recent Submissions
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Problem</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Verdict</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e3e3e]">
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No submissions yet
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((sub) => {
                    const badge = getVerdictBadge(sub.verdict);
                    return (
                      <tr key={sub.id} className="hover:bg-[#3e3e3e]/30">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white font-medium">{sub.student_name}</p>
                            <p className="text-gray-500 text-xs">{sub.usn}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{sub.problem_title}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${badge.class}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-white font-medium">{sub.score}</td>
                        <td className="px-4 py-3 text-right text-gray-400 text-sm">
                          {new Date(sub.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
