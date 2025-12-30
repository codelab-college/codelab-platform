import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getAssignments } from '../services/api';
import { FileText, Calendar, User, Clock, ChevronRight, BookOpen, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await getAssignments();
      setAssignments(response.data.assignments);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      not_started: { class: 'bg-gray-700 text-gray-300', text: 'Not Started' },
      in_progress: { class: 'bg-[#ffa116]/20 text-[#ffa116]', text: 'In Progress' },
      submitted: { class: 'bg-[#00b8a3]/20 text-[#00b8a3]', text: 'Submitted' },
    };
    return badges[status] || { class: 'bg-gray-700 text-gray-300', text: status };
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'all') return true;
    return assignment.student_status === filter;
  });

  const filterButtons = [
    { id: 'all', label: 'All', count: assignments.length },
    { id: 'not_started', label: 'Not Started', count: assignments.filter(a => a.student_status === 'not_started').length },
    { id: 'in_progress', label: 'In Progress', count: assignments.filter(a => a.student_status === 'in_progress').length },
    { id: 'submitted', label: 'Submitted', count: assignments.filter(a => a.student_status === 'submitted').length },
  ];

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-[#ffa116]" />
              Assignments
            </h1>
            <p className="text-gray-400 mt-1">View and complete your coding assignments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                filter === btn.id
                  ? 'bg-[#ffa116] text-black'
                  : 'bg-[#282828] text-gray-400 hover:text-white hover:bg-[#3e3e3e] border border-[#3e3e3e]'
              }`}
            >
              {btn.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                filter === btn.id ? 'bg-black/20' : 'bg-[#3e3e3e]'
              }`}>
                {btn.count}
              </span>
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No assignments found</h3>
            <p className="text-gray-400">
              {filter === 'all'
                ? 'No assignments available at the moment'
                : `No assignments with status "${filter.replace('_', ' ')}"`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => {
              const statusBadge = getStatusBadge(assignment.student_status);
              const dueDate = new Date(assignment.due_date);
              const now = new Date();
              const isOverdue = dueDate < now && assignment.student_status !== 'submitted';

              return (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5 hover:border-[#4a4a4a] hover:bg-[#2d2d2d] transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white group-hover:text-[#ffa116] transition-colors line-clamp-1 flex-1 pr-2">
                      {assignment.title}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {assignment.description || 'No description provided'}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-400">
                      <User className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{assignment.teacher_name}</span>
                    </div>

                    <div className="flex items-center text-gray-400">
                      <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{assignment.problem_count} problems</span>
                    </div>

                    <div className={`flex items-center ${isOverdue ? 'text-[#ff375f]' : 'text-gray-400'}`}>
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>
                        Due: {dueDate.toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>

                    {assignment.is_timed && (
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Timed: {assignment.duration_minutes} minutes</span>
                      </div>
                    )}
                  </div>

                  {assignment.score !== null && (
                    <div className="mt-4 pt-4 border-t border-[#3e3e3e] flex items-center justify-between">
                      <span className="text-sm text-gray-400">Score</span>
                      <span className="text-xl font-bold text-[#ffa116]">
                        {assignment.score}/{assignment.total_marks}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end text-[#ffa116] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Assignment
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Assignments;
