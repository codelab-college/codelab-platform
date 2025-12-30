import { useState } from 'react';
import { Search, TrendingUp, FileText, Award } from 'lucide-react';
import { teacherAPI } from '../../services/teacherApi';
import toast from 'react-hot-toast';

const StudentSearch = () => {
  const [usn, setUsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!usn.trim()) return;

    setLoading(true);
    try {
      const response = await teacherAPI.searchStudent(usn);
      setStudentData(response.data);
    } catch (error) {
      console.error('Error searching student:', error);
      if (error.response?.status === 404) {
        toast.error('Student not found');
      } else {
        toast.error('Failed to search student');
      }
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Student Search</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
              placeholder="Enter Student USN (e.g., 1MS21CS001)"
              className="flex-1 px-6 py-4 bg-[#282828] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa116]"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-4 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Student Profile */}
        {studentData && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{studentData.student.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">USN</p>
                  <p className="text-white font-semibold">{studentData.student.usn}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Email</p>
                  <p className="text-white">{studentData.student.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Department</p>
                  <p className="text-white">{studentData.student.department}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Semester</p>
                  <p className="text-white">{studentData.student.semester}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Award className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Problems Solved</p>
                    <p className="text-2xl font-bold text-white">{studentData.stats.problems_solved || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Problems Attempted</p>
                    <p className="text-2xl font-bold text-white">{studentData.stats.problems_attempted || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-[#ffa116]/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-[#ffa116]" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Average Score</p>
                    <p className="text-2xl font-bold text-white">
                      {studentData.stats.averageScore ? studentData.stats.averageScore.toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment History */}
            <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Assignment History</h3>
              {studentData.assignments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No assignments attempted yet</p>
              ) : (
                <div className="space-y-3">
                  {studentData.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{assignment.assignment_title}</h4>
                        <span
                          className={`px-3 py-1 rounded text-xs font-semibold ${
                            assignment.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : assignment.status === 'in_progress'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span>Score: {assignment.score}/{assignment.max_marks}</span>
                        <span>{assignment.submission_count} submissions</span>
                        {assignment.submitted_at && (
                          <span>Submitted: {new Date(assignment.submitted_at).toLocaleDateString()}</span>
                        )}
                        {assignment.violations > 0 && (
                          <span className="text-red-400">{assignment.violations} violations</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSearch;
