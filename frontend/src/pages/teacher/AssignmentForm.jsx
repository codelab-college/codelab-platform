import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { teacherAPI } from '../../services/teacherApi';
import toast from 'react-hot-toast';

const AssignmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    total_marks: 100,
    detect_violations: true,
    is_hidden: false,
    allowed_languages: 'python,javascript,cpp',
    access_type: 'all',
    selected_students: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchAssignment();
    }
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await teacherAPI.getAssignment(id);
      const assignment = response.data.assignment;
      
      // Format due_date for datetime-local input
      let formattedDate = '';
      if (assignment.due_date) {
        const date = new Date(assignment.due_date);
        formattedDate = date.toISOString().slice(0, 16);
      }

      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        due_date: formattedDate,
        total_marks: assignment.total_marks || 100,
        detect_violations: assignment.detect_violations !== 0,
        is_hidden: Boolean(assignment.is_hidden),
        allowed_languages: assignment.allowed_languages || 'python,javascript,cpp',
        access_type: assignment.access_type || 'all',
        selected_students: assignment.selected_students || '',
      });
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        due_date: formData.due_date || null,
      };

      if (isEdit) {
        await teacherAPI.updateAssignment(id, submitData);
        toast.success('Assignment updated successfully');
        navigate(`/teacher/assignments/${id}`);
      } else {
        const response = await teacherAPI.createAssignment(submitData);
        toast.success('Assignment created successfully');
        navigate(`/teacher/assignments/${response.data.assignment.id}`);
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/teacher/assignments')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </button>
          <h1 className="text-3xl font-bold text-white">
            {isEdit ? 'Edit Assignment' : 'Create Assignment'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa116]"
                  placeholder="e.g., Arrays and Strings - Assignment 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa116]"
                  placeholder="Provide detailed instructions for students..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Student Access</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Who can access this assignment?
                </label>
                <select
                  name="access_type"
                  value={formData.access_type || 'all'}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
                >
                  <option value="all">All Students</option>
                  <option value="selected">Selected Students Only</option>
                </select>
              </div>

              {formData.access_type === 'selected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Student USNs (comma separated)
                  </label>
                  <textarea
                    name="selected_students"
                    value={formData.selected_students || ''}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa116]"
                    placeholder="e.g., 1MS21CS001, 1MS21CS002, 1MS21CS003"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Only these students will see this assignment when they login
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security & Settings */}
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Security & Settings</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="detect_violations"
                  checked={formData.detect_violations}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-[#1a1a1a] border-[#3e3e3e] text-[#ffa116] focus:ring-[#ffa116]"
                />
                <span className="text-gray-300">
                  Detect violations (tab switching, copy-paste, etc.)
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_hidden"
                  checked={formData.is_hidden}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-[#1a1a1a] border-[#3e3e3e] text-[#ffa116] focus:ring-[#ffa116]"
                />
                <span className="text-gray-300">
                  Hide assignment (students won't see it until unhidden)
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Allowed Languages
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allowed_languages.includes('python')}
                      onChange={(e) => {
                        const langs = formData.allowed_languages.split(',');
                        if (e.target.checked) {
                          langs.push('python');
                        } else {
                          const idx = langs.indexOf('python');
                          if (idx > -1) langs.splice(idx, 1);
                        }
                        setFormData({ ...formData, allowed_languages: langs.filter(Boolean).join(',') });
                      }}
                      className="w-4 h-4 rounded bg-[#1a1a1a] border-[#3e3e3e] text-[#ffa116]"
                    />
                    <span className="text-gray-300">Python</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allowed_languages.includes('javascript')}
                      onChange={(e) => {
                        const langs = formData.allowed_languages.split(',');
                        if (e.target.checked) {
                          langs.push('javascript');
                        } else {
                          const idx = langs.indexOf('javascript');
                          if (idx > -1) langs.splice(idx, 1);
                        }
                        setFormData({ ...formData, allowed_languages: langs.filter(Boolean).join(',') });
                      }}
                      className="w-4 h-4 rounded bg-[#1a1a1a] border-[#3e3e3e] text-[#ffa116]"
                    />
                    <span className="text-gray-300">JavaScript</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.allowed_languages.includes('cpp')}
                      onChange={(e) => {
                        const langs = formData.allowed_languages.split(',');
                        if (e.target.checked) {
                          langs.push('cpp');
                        } else {
                          const idx = langs.indexOf('cpp');
                          if (idx > -1) langs.splice(idx, 1);
                        }
                        setFormData({ ...formData, allowed_languages: langs.filter(Boolean).join(',') });
                      }}
                      className="w-4 h-4 rounded bg-[#1a1a1a] border-[#3e3e3e] text-[#ffa116]"
                    />
                    <span className="text-gray-300">C++</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/teacher/assignments')}
              className="px-6 py-3 bg-[#282828] hover:bg-[#3e3e3e] border border-[#3e3e3e] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : isEdit ? 'Update Assignment' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;
