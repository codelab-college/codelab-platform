import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getAssignment, startAssignment } from '../services/api';
import { 
  ArrowLeft, Play, CheckCircle, Clock, User, Calendar, 
  Shield, FileText, Award, ChevronRight, Lock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await getAssignment(id);
      setAssignment(response.data.assignment);
      setProblems(response.data.problems);
    } catch (error) {
      toast.error('Failed to load assignment');
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssignment = async () => {
    setStarting(true);
    try {
      await startAssignment(id);
      toast.success('Assignment started!');
      fetchAssignment();
    } catch (error) {
      toast.error('Failed to start assignment');
    } finally {
      setStarting(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      easy: 'text-[#00b8a3]',
      medium: 'text-[#ffc01e]',
      hard: 'text-[#ff375f]',
    };
    return badges[difficulty] || 'text-gray-400';
  };

  const getStatusBadge = (status) => {
    const badges = {
      not_started: { class: 'bg-gray-700 text-gray-300', text: 'Not Started' },
      in_progress: { class: 'bg-[#ffa116]/20 text-[#ffa116]', text: 'In Progress' },
      submitted: { class: 'bg-[#00b8a3]/20 text-[#00b8a3]', text: 'Submitted' },
    };
    return badges[status] || badges.not_started;
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

  const statusBadge = getStatusBadge(assignment.student_status);
  const dueDate = new Date(assignment.due_date);
  const isOverdue = dueDate < new Date() && assignment.student_status !== 'submitted';

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          to="/assignments"
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Link>

        {/* Assignment Header */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {assignment.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.class}`}>
                  {statusBadge.text}
                </span>
              </div>
              
              <p className="text-gray-500 dark:text-gray-400 mb-6">{assignment.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs">Instructor</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{assignment.teacher_name}</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Problems</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{problems.length} Problems</p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className={`flex items-center gap-2 mb-1 ${isOverdue ? 'text-[#ff375f]' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Due Date</span>
                  </div>
                  <p className={`font-medium ${isOverdue ? 'text-[#ff375f]' : 'text-gray-900 dark:text-white'}`}>
                    {dueDate.toLocaleDateString()}
                    {isOverdue && ' (Overdue)'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">Total Marks</span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">{assignment.total_marks} Points</p>
                </div>
              </div>

              {assignment.is_timed && (
                <div className="mt-4 flex items-center gap-2 text-[#ffa116]">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Timed Assignment: {assignment.duration_minutes} minutes</span>
                </div>
              )}
            </div>

            <div className="lg:text-right">
              {assignment.student_status === 'not_started' ? (
                <button
                  onClick={handleStartAssignment}
                  disabled={starting}
                  className="w-full lg:w-auto px-6 py-3 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {starting ? 'Starting...' : 'Start Assignment'}
                </button>
              ) : (
                <div>
                  {assignment.score !== null && (
                    <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-4 inline-block">
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Your Score</p>
                      <p className="text-3xl font-bold text-[#ffa116]">
                        {assignment.score}<span className="text-gray-500">/{assignment.total_marks}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secure Environment Notice */}
        <div className="bg-[#ffa116]/10 border border-[#ffa116]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#ffa116] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-[#ffa116] font-medium mb-1">Secure Exam Environment</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                When you click on a problem, you'll be asked to enable camera and microphone for proctoring.
                The exam will run in fullscreen mode. Tab switching and window changes will be recorded as violations.
              </p>
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
            {problems.map((problem, index) => {
              const isLocked = assignment.student_status === 'not_started';
              
              return (
                <div
                  key={problem.id}
                  className={`relative ${!isLocked ? 'hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/50' : ''} transition-colors`}
                >
                  {isLocked ? (
                    <div className="p-5 flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-[#3e3e3e] rounded-lg flex items-center justify-center">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="text-gray-900 dark:text-white font-medium">
                            {index + 1}. {problem.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-sm font-medium ${getDifficultyBadge(problem.difficulty)}`}>
                              {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{problem.marks} marks</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">Start assignment to unlock</span>
                    </div>
                  ) : (
                    <Link
                      to={`/problems/${problem.id}`}
                      className="p-5 flex items-center justify-between block"
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
                            <span className={`text-sm font-medium ${getDifficultyBadge(problem.difficulty)}`}>
                              {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{problem.marks} marks</span>
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
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning */}
        {assignment.student_status === 'in_progress' && (
          <div className="bg-[#ff375f]/10 border border-[#ff375f]/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#ff375f] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[#ff375f] font-medium mb-1">Important</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Make sure you have a stable internet connection. Your progress is automatically saved.
                  Complete all problems before the due date to get full marks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssignmentDetail;
