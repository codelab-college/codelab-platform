import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { teacherAPI } from '../../services/teacherApi';
import toast from 'react-hot-toast';

const TestCaseModal = ({ problemId, onClose }) => {
  const [testCases, setTestCases] = useState([]);
  const [newTestCase, setNewTestCase] = useState({
    input: '',
    expected_output: '',
    is_sample: false,
    marks: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestCases();
  }, [problemId]);

  const fetchTestCases = async () => {
    try {
      const response = await teacherAPI.getProblem(problemId);
      setTestCases(response.data.testCases || []);
    } catch (error) {
      console.error('Error fetching test cases:', error);
      toast.error('Failed to load test cases');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (e) => {
    e.preventDefault();
    
    if (!newTestCase.input.trim() || !newTestCase.expected_output.trim()) {
      toast.error('Input and output are required');
      return;
    }

    try {
      await teacherAPI.createTestCase({
        problem_id: problemId,
        ...newTestCase,
      });
      toast.success('Test case added successfully');
      setNewTestCase({ input: '', expected_output: '', is_sample: false, marks: 1 });
      fetchTestCases();
    } catch (error) {
      console.error('Error adding test case:', error);
      toast.error('Failed to add test case');
    }
  };

  const handleToggleSample = async (testCaseId, currentValue) => {
    try {
      await teacherAPI.updateTestCase(testCaseId, { is_sample: !currentValue });
      toast.success('Test case updated');
      fetchTestCases();
    } catch (error) {
      toast.error('Failed to update test case');
    }
  };

  const handleDeleteTestCase = async (testCaseId) => {
    if (!confirm('Delete this test case?')) return;

    try {
      await teacherAPI.deleteTestCase(testCaseId);
      toast.success('Test case deleted');
      setTestCases(testCases.filter((tc) => tc.id !== testCaseId));
    } catch (error) {
      toast.error('Failed to delete test case');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#282828] border-b border-[#3e3e3e] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Test Cases</h2>
            <p className="text-sm text-gray-400 mt-1">
              Sample test cases are visible to students. Hidden test cases are used for final grading.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Add New Test Case */}
          <form onSubmit={handleAddTestCase} className="bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add New Test Case</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Input *
                </label>
                <textarea
                  value={newTestCase.input}
                  onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#3e3e3e] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#ffa116]"
                  placeholder="Enter test input..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expected Output *
                </label>
                <textarea
                  value={newTestCase.expected_output}
                  onChange={(e) => setNewTestCase({ ...newTestCase, expected_output: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#3e3e3e] rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#ffa116]"
                  placeholder="Enter expected output..."
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newTestCase.is_sample}
                  onChange={(e) => setNewTestCase({ ...newTestCase, is_sample: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#0a0a0a] border-[#3e3e3e] text-[#ffa116]"
                />
                <span className="text-sm text-gray-300">Sample test case (visible to students)</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-300">Marks:</label>
                <input
                  type="number"
                  value={newTestCase.marks}
                  onChange={(e) => setNewTestCase({ ...newTestCase, marks: parseInt(e.target.value) })}
                  min="1"
                  className="w-20 px-3 py-2 bg-[#0a0a0a] border border-[#3e3e3e] rounded-lg text-white focus:outline-none focus:border-[#ffa116]"
                />
              </div>

              <button
                type="submit"
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Test Case
              </button>
            </div>
          </form>

          {/* Existing Test Cases */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Existing Test Cases ({testCases.length})
            </h3>

            {loading ? (
              <p className="text-gray-400 text-center py-8">Loading test cases...</p>
            ) : testCases.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No test cases added yet</p>
            ) : (
              <div className="space-y-3">
                {testCases.map((tc, index) => (
                  <div
                    key={tc.id}
                    className="bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-500">#{index + 1}</span>
                        {tc.is_sample ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded font-semibold">
                            SAMPLE
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-semibold">
                            HIDDEN
                          </span>
                        )}
                        <span className="text-sm text-gray-400">{tc.marks} mark(s)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSample(tc.id, tc.is_sample)}
                          className="p-2 hover:bg-[#282828] text-gray-400 hover:text-white rounded-lg transition-colors"
                          title={tc.is_sample ? 'Make Hidden' : 'Make Sample'}
                        >
                          {tc.is_sample ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteTestCase(tc.id)}
                          className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Input:</p>
                        <pre className="bg-[#0a0a0a] border border-[#3e3e3e] rounded p-3 text-sm text-white font-mono overflow-x-auto">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Expected Output:</p>
                        <pre className="bg-[#0a0a0a] border border-[#3e3e3e] rounded p-3 text-sm text-white font-mono overflow-x-auto">
                          {tc.expected_output}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCaseModal;
