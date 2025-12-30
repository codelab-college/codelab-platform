import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, EyeOff, Lock, Clock, Users } from 'lucide-react';
import { teacherAPI } from '../../services/teacherApi';
import toast from 'react-hot-toast';

const AssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await teacherAPI.getAssignments();
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
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

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Assignments</h1>
            <p className="text-gray-400">Manage your assignments and track student progress</p>
          </div>
          <Link
            to="/teacher/assignments/create"
            className="flex items-center gap-2 px-6 py-3 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">No assignments created yet</p>
            <Link
              to="/teacher/assignments/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Assignment
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => (
              <Link
                key={assignment.id}
                to={`/teacher/assignments/${assignment.id}`}
                className="block bg-[#282828] border border-[#3e3e3e] hover:border-[#ffa116] rounded-xl p-6 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-white">{assignment.title}</h2>
                      {assignment.is_hidden && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                          Hidden
                        </span>
                      )}
                      {assignment.is_closed && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Closed
                        </span>
                      )}
                      {!assignment.is_closed && assignment.status === 'active' && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{assignment.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{assignment.students_attempted || 0} attempted</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">{assignment.problem_count || 0} problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">{assignment.total_marks} marks</span>
                  </div>
                  {assignment.due_date && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="text-right">
                    <span className="text-sm text-[#ffa116]">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsList;
