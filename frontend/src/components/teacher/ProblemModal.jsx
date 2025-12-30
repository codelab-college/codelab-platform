import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { teacherAPI } from '../../services/teacherApi';
import toast from 'react-hot-toast';

const ProblemModal = ({ assignmentId, problem, onClose, onSuccess }) => {
  const isEdit = Boolean(problem);
  
  const [formData, setFormData] = useState({
    assignment_id: assignmentId,
    title: '',
    description: '',
    input_format: '',
    output_format: '',
    constraints: '',
    difficulty: 'medium',
    marks: 10,
    time_limit: 1000,
    memory_limit: 256,
  });

  useEffect(() => {
    if (problem) {
      setFormData({
        assignment_id: assignmentId,
        title: problem.title || '',
        description: problem.description || '',
        input_format: problem.input_format || '',
        output_format: problem.output_format || '',
        constraints: problem.constraints || '',
        difficulty: problem.difficulty || 'medium',
        marks: problem.marks || 10,
        time_limit: problem.time_limit || 1000,
        memory_limit: problem.memory_limit || 256,
      });
    }
  }, [problem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEdit) {
        await teacherAPI.updateProblem(problem.id, formData);
        toast.success('Problem updated successfully');
      } else {
        await teacherAPI.createProblem(formData);
        toast.success('Problem created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving problem:', error);
      toast.error('Failed to save problem');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#282828] border-b border-[#3e3e3e] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Problem' : 'Add Problem'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Problem Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
              placeholder="e.g., Two Sum"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Problem Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="6"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
              placeholder="Write a detailed problem statement..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Input Format
              </label>
              <textarea
                value={formData.input_format}
                onChange={(e) => setFormData({ ...formData, input_format: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
                placeholder="Describe input format..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Output Format
              </label>
              <textarea
                value={formData.output_format}
                onChange={(e) => setFormData({ ...formData, output_format: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
                placeholder="Describe output format..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Constraints
            </label>
            <textarea
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
              placeholder="e.g., 1 <= n <= 10^5"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Marks
              </label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                min="1"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Limit (ms)
              </label>
              <input
                type="number"
                value={formData.time_limit}
                onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                min="100"
                step="100"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Memory (MB)
              </label>
              <input
                type="number"
                value={formData.memory_limit}
                onChange={(e) => setFormData({ ...formData, memory_limit: parseInt(e.target.value) })}
                min="64"
                step="64"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-[#3e3e3e]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[#1a1a1a] hover:bg-[#252525] border border-[#3e3e3e] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              {isEdit ? 'Update Problem' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;
