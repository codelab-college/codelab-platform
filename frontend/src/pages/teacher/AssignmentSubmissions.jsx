import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacherAPI } from '../../services/teacherApi';
import { 
  ArrowLeft, Users, CheckCircle, XCircle, Clock, 
  FileText, Award, AlertTriangle, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssignmentSubmissions = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState({ submitted: [], notSubmitted: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'submitted', 'pending'

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get assignment details
      const assignmentRes = await teacherAPI.getAssignment(id);
      setAssignment(assignmentRes.data.assignment);
      
      // Get submissions
      const submissionsRes = await teacherAPI.getAssignmentSubmissions(id);
      setSubmissions(submissionsRes.data.submissions || []);
      
      // Get student status
      try {
        const studentsRes = await teacherAPI.getAssignmentStudents(id);
        setStudents({
          submitted: studentsRes.data.submitted || [],
          notSubmitted: studentsRes.data.notSubmitted || []
        });
      } catch (e) {
        // If the endpoint doesn't exist, derive from submissions
        const submittedUSNs = new Set(submissionsRes.data.submissions?.map(s => s.usn) || []);
        setStudents({
          submitted: Array.from(submittedUSNs).map(usn => ({ usn })),
          notSubmitted: []
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load submission data');
    } finally {
      setLoading(false);
    }
  };

  const isBeforeDueDate = (submittedAt) => {
    if (!assignment?.due_date || !submittedAt) return false;
    return new Date(submittedAt) <= new Date(assignment.due_date);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVerdictBadge = (verdict) => {
    const badges = {
      'AC': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Accepted' },
      'WA': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Wrong Answer' },
      'TLE': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Time Limit' },
      'RE': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Runtime Error' },
      'CE': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Compile Error' }
    };
    const badge = badges[verdict] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: verdict };
    return (
      <span className={`px-2 py-1 rounded text-xs ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Group submissions by student
  const submissionsByStudent = submissions.reduce((acc, sub) => {
    const key = sub.usn;
    if (!acc[key]) {
      acc[key] = {
        usn: sub.usn,
        name: sub.student_name,
        submissions: [],
        latestSubmission: null,
        totalScore: 0,
        problemsAttempted: new Set()
      };
    }
    acc[key].submissions.push(sub);
    acc[key].problemsAttempted.add(sub.problem_id);
    if (!acc[key].latestSubmission || new Date(sub.submitted_at) > new Date(acc[key].latestSubmission.submitted_at)) {
      acc[key].latestSubmission = sub;
    }
    if (sub.verdict === 'AC') {
      acc[key].totalScore += sub.score || 0;
    }
    return acc;
  }, {});

  const studentList = Object.values(submissionsByStudent);

  // Filter based on search and active tab
  const filteredStudents = studentList.filter(student => {
    const matchesSearch = !searchQuery || 
      student.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'submitted') {
      return matchesSearch && student.submissions.length > 0;
    }
    return matchesSearch;
  });

  // Get students who haven't submitted
  const pendingStudents = students.notSubmitted.filter(student => 
    !searchQuery || 
    student.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa116]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/teacher/assignments/${id}`}
            className="p-2 hover:bg-[#3e3e3e] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Submissions</h1>
            <p className="text-gray-400">{assignment?.title}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#282828] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Submissions</p>
              <p className="text-2xl font-bold text-white">{submissions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#282828] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Students Submitted</p>
              <p className="text-2xl font-bold text-white">{studentList.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#282828] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-2xl font-bold text-white">{students.notSubmitted.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#282828] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffa116]/20 rounded-lg">
              <Award className="w-5 h-5 text-[#ffa116]" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Due Date</p>
              <p className="text-sm font-medium text-white">{formatDate(assignment?.due_date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-[#ffa116] text-black'
                : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
            }`}
          >
            All Students ({studentList.length})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'submitted'
                ? 'bg-green-600 text-white'
                : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
            }`}
          >
            Submitted ({studentList.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-[#3e3e3e] text-gray-300 hover:bg-[#4e4e4e]'
            }`}
          >
            Pending ({students.notSubmitted.length})
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by USN or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#3e3e3e] border border-[#4e4e4e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa116]"
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'pending' ? (
        // Pending students list
        <div className="bg-[#282828] rounded-lg overflow-hidden">
          {students.notSubmitted.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-400">All students have submitted!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">USN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e3e3e]">
                {pendingStudents.map((student, idx) => (
                  <tr key={idx} className="hover:bg-[#3e3e3e]/50">
                    <td className="px-4 py-3">
                      <span className="text-white font-mono">{student.usn || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{student.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-yellow-400">
                        <Clock className="w-4 h-4" />
                        Not Submitted
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        // Submitted students list
        <div className="bg-[#282828] rounded-lg overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No submissions yet</p>
              <p className="text-gray-500 text-sm mt-1">Submissions will appear here once students submit their work</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">USN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Submissions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Latest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">On Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e3e3e]">
                {filteredStudents.map((student) => {
                  const onTime = isBeforeDueDate(student.latestSubmission?.submitted_at);
                  return (
                    <tr key={student.usn} className="hover:bg-[#3e3e3e]/50">
                      <td className="px-4 py-3">
                        <span className="text-white font-mono">{student.usn}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{student.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-[#ffa116] font-medium">{student.submissions.length}</span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({student.problemsAttempted.size} problems)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-gray-300 text-sm">
                            {formatDate(student.latestSubmission?.submitted_at)}
                          </span>
                          {student.latestSubmission && getVerdictBadge(student.latestSubmission.verdict)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {onTime ? (
                          <span className="flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-5 h-5" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400">
                            <XCircle className="w-5 h-5" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-medium">{student.totalScore}</span>
                        <span className="text-gray-500">/{assignment?.total_marks || 100}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Individual Submissions (Collapsible) */}
      {activeTab !== 'pending' && submissions.length > 0 && (
        <div className="bg-[#282828] rounded-lg p-4">
          <h2 className="text-lg font-bold text-white mb-4">All Submissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">USN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Problem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Verdict</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Language</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">On Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e3e3e]">
                {submissions.slice(0, 50).map((sub) => {
                  const onTime = isBeforeDueDate(sub.submitted_at);
                  return (
                    <tr key={sub.id} className="hover:bg-[#3e3e3e]/50">
                      <td className="px-4 py-3">
                        <span className="text-white font-mono text-sm">{sub.usn}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{sub.problem_title}</td>
                      <td className="px-4 py-3">{getVerdictBadge(sub.verdict)}</td>
                      <td className="px-4 py-3">
                        <span className="text-white">{sub.score || 0}</span>
                        <span className="text-gray-500">/{sub.max_marks}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[#3e3e3e] rounded text-xs text-gray-300">
                          {sub.language}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {formatDate(sub.submitted_at)}
                      </td>
                      <td className="px-4 py-3">
                        {onTime ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {submissions.length > 50 && (
              <p className="text-center text-gray-500 text-sm py-3">
                Showing 50 of {submissions.length} submissions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissions;
