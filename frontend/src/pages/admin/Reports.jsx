import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { getAssignmentReport, getStudentReport } from '../../services/adminApi';
import { 
  BarChart3, FileText, Users, Download, Search, 
  ChevronRight, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Reports = () => {
  const [reportType, setReportType] = useState('assignment');
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchAssignmentReport = async (id) => {
    setLoading(true);
    try {
      const response = await getAssignmentReport(id);
      setReport(response.data);
      setSelectedAssignment(id);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    const headers = ['USN', 'Name', 'Section', 'Problems Attempted', 'Problems Solved', 'Total Score'];
    const rows = report.studentStats.map(s => [
      s.usn,
      s.name,
      s.section || '-',
      s.problems_attempted || 0,
      s.problems_solved || 0,
      s.total_score || 0
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.assignment.title}_report.csv`;
    a.click();
    toast.success('Report exported!');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 mt-1">Generate and export performance reports</p>
          </div>
          {report && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#00b8a3] hover:bg-[#00d4bb] text-black font-medium rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Selection */}
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#3e3e3e]">
              <h2 className="text-lg font-semibold text-white">Select Assignment</h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {[1, 2, 3].map((id) => (
                  <button
                    key={id}
                    onClick={() => fetchAssignmentReport(id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedAssignment === id 
                        ? 'bg-[#ff375f] text-white' 
                        : 'bg-[#1a1a1a] hover:bg-[#3e3e3e] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Assignment {id}</p>
                        <p className="text-sm opacity-70">Click to view report</p>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff375f]"></div>
              </div>
            ) : report ? (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Total Problems</p>
                    <p className="text-2xl font-bold text-white">{report.summary.totalProblems}</p>
                  </div>
                  <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Total Marks</p>
                    <p className="text-2xl font-bold text-[#ffa116]">{report.summary.totalMarks}</p>
                  </div>
                  <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Students</p>
                    <p className="text-2xl font-bold text-white">{report.summary.totalStudents}</p>
                  </div>
                  <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-4">
                    <p className="text-gray-400 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-[#00b8a3]">{report.summary.averageScore}</p>
                  </div>
                </div>

                {/* Student Performance Table */}
                <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[#3e3e3e]">
                    <h3 className="text-lg font-semibold text-white">Student Performance</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#1a1a1a]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Attempted</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Solved</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3e3e3e]">
                        {report.studentStats.map((student, index) => (
                          <tr key={student.id} className="hover:bg-[#3e3e3e]/30">
                            <td className="px-4 py-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                index === 2 ? 'bg-amber-600/20 text-amber-500' :
                                'bg-[#3e3e3e] text-gray-400'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-white font-medium">{student.name}</p>
                                <p className="text-gray-500 text-xs">{student.usn}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-300">
                              {student.problems_attempted || 0}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[#00b8a3] font-medium">
                                {student.problems_solved || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-3 py-1 bg-[#ffa116]/20 text-[#ffa116] rounded-full text-sm font-bold">
                                {student.total_score || 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-white mb-2">Select an Assignment</h3>
                <p className="text-gray-400">Choose an assignment from the left to view its report</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
