import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Users,
  FileText
} from 'lucide-react';
import { teacherAPI } from '../../services/teacherApi';
import toast from 'react-hot-toast';
import ProblemModal from '../../components/teacher/ProblemModal';
import TestCaseModal from '../../components/teacher/TestCaseModal';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problemModal, setProblemModal] = useState({ open: false, problem: null });
  const [testCaseModal, setTestCaseModal] = useState({ open: false, problemId: null });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await teacherAPI.getAssignment(id);
      setAssignment(response.data.assignment);
      setProblems(response.data.problems || []);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await teacherAPI.updateAssignment(id, { is_hidden: !assignment.is_hidden });
      setAssignment({ ...assignment, is_hidden: !assignment.is_hidden });
      toast.success(assignment.is_hidden ? 'Assignment is now visible' : 'Assignment is now hidden');
    } catch (error) {
      toast.error('Failed to update visibility');
    }
  };

  const handleToggleClosed = async () => {
    try {
      await teacherAPI.updateAssignment(id, { is_closed: !assignment.is_closed });
      setAssignment({ ...assignment, is_closed: !assignment.is_closed });
      toast.success(assignment.is_closed ? 'Assignment reopened' : 'Assignment closed');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await teacherAPI.deleteProblem(problemId);
      setProblems(problems.filter((p) => p.id !== problemId));
      toast.success('Problem deleted successfully');
    } catch (error) {
      toast.error('Failed to delete problem');
    }
  };

  const handleDeleteAssignment = async () => {
    if (!confirm('Are you sure? This will delete the assignment and all its problems permanently.')) return;

    try {
      await teacherAPI.deleteAssignment(id);
      toast.success('Assignment deleted successfully');
      navigate('/teacher/assignments');
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-white">Assignment not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{assignment.title}</h1>
                {assignment.is_hidden && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded">
                    Hidden
                  </span>
                )}
                {assignment.is_closed && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded">
                    Closed
                  </span>
                )}
              </div>
              <p className="text-gray-400">{assignment.description}</p>
              {assignment.due_date && (
                <p className="text-sm text-gray-500 mt-2">
                  Due: {new Date(assignment.due_date).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/teacher/assignments/${id}/submissions`}
                className="flex items-center gap-2 px-4 py-2 bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                View Submissions
              </Link>
              <Link
                to={`/teacher/assignments/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Assignment Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={handleToggleVisibility}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white rounded-lg transition-colors"
          >
            {assignment.is_hidden ? (
              <>
                <Eye className="w-4 h-4" />
                Show Assignment
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Assignment
              </>
            )}
          </button>

          <button
            onClick={handleToggleClosed}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white rounded-lg transition-colors"
          >
            {assignment.is_closed ? (
              <>
                <Unlock className="w-4 h-4" />
                Reopen
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Close
              </>
            )}
          </button>

          <Link
            to={`/teacher/assignments/${id}/students`}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            Student Status
          </Link>

          <button
            onClick={handleDeleteAssignment}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>

        {/* Assignment Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Marks</p>
            <p className="text-2xl font-bold text-white">{assignment.total_marks}</p>
          </div>
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Problems</p>
            <p className="text-2xl font-bold text-white">{problems.length}</p>
          </div>
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Timer</p>
            <p className="text-2xl font-bold text-white">
              {assignment.is_timed ? `${assignment.duration_minutes}m` : 'No'}
            </p>
          </div>
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Violations</p>
            <p className="text-2xl font-bold text-white">
              {assignment.detect_violations ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>

        {/* Problems Section */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Problems</h2>
            <button
              onClick={() => setProblemModal({ open: true, problem: null })}
              className="flex items-center gap-2 px-4 py-2 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Problem
            </button>
          </div>

          {problems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No problems added yet</p>
              <button
                onClick={() => setProblemModal({ open: true, problem: null })}
                className="px-4 py-2 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors"
              >
                Add Your First Problem
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div
                  key={problem.id}
                  className="bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                        <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            problem.difficulty === 'easy'
                              ? 'bg-green-500/20 text-green-400'
                              : problem.difficulty === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                        <span className="text-sm text-gray-400">{problem.marks} marks</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {problem.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{problem.test_case_count || 0} test cases</span>
                        <span>{problem.submission_count || 0} submissions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTestCaseModal({ open: true, problemId: problem.id })}
                        className="flex items-center gap-1 px-3 py-2 bg-[#282828] hover:bg-[#3e3e3e] text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
                        title="Manage Test Cases"
                      >
                        <Plus className="w-4 h-4" />
                        Add Test Cases
                      </button>
                      <button
                        onClick={() => setProblemModal({ open: true, problem })}
                        className="p-2 hover:bg-[#282828] text-gray-400 hover:text-white rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(problem.id)}
                        className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {problemModal.open && (
        <ProblemModal
          assignmentId={id}
          problem={problemModal.problem}
          onClose={() => setProblemModal({ open: false, problem: null })}
          onSuccess={fetchAssignment}
        />
      )}
      {testCaseModal.open && (
        <TestCaseModal
          problemId={testCaseModal.problemId}
          onClose={() => setTestCaseModal({ open: false, problemId: null })}
        />
      )}
    </div>
  );
};

export default AssignmentDetail;
