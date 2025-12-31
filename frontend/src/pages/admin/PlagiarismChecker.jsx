import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { checkPlagiarism, compareSumbissions } from '../../services/adminApi';
import { 
  AlertTriangle, Search, Eye, FileCode, X, 
  ChevronDown, Users, Percent
} from 'lucide-react';
import toast from 'react-hot-toast';

const PlagiarismChecker = () => {
  const [assignmentId, setAssignmentId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const handleCheck = async () => {
    if (!assignmentId) {
      toast.error('Please enter an assignment ID');
      return;
    }

    setLoading(true);
    try {
      const response = await checkPlagiarism(assignmentId);
      setResults(response.data.results);
      if (response.data.results.length === 0) {
        toast.success('No plagiarism detected!');
      } else {
        toast.warning(`Found ${response.data.results.length} problem(s) with similar submissions`);
      }
    } catch (error) {
      toast.error('Plagiarism check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async (id1, id2) => {
    setCompareLoading(true);
    setShowCompare(true);
    try {
      const response = await compareSumbissions(id1, id2);
      setComparison(response.data);
    } catch (error) {
      toast.error('Failed to load comparison');
      setShowCompare(false);
    } finally {
      setCompareLoading(false);
    }
  };

  const getSimilarityColor = (similarity) => {
    if (similarity >= 90) return 'text-[#ff375f] bg-[#ff375f]/20';
    if (similarity >= 80) return 'text-orange-400 bg-orange-400/20';
    if (similarity >= 70) return 'text-[#ffc01e] bg-[#ffc01e]/20';
    return 'text-gray-400 bg-gray-400/20';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Plagiarism Checker</h1>
          <p className="text-gray-400 mt-1">Detect similar code submissions</p>
        </div>

        {/* Search Form */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Assignment ID
              </label>
              <input
                type="number"
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                placeholder="Enter assignment ID (e.g., 1)"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:border-[#ff375f] focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCheck}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-[#ff375f] hover:bg-[#ff4d6d] text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Check Plagiarism
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="space-y-6">
            {results.map((problem) => (
              <div key={problem.problemId} className="bg-[#282828] border border-[#3e3e3e] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#3e3e3e] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ff375f]/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-[#ff375f]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{problem.problemTitle}</h3>
                      <p className="text-gray-400 text-sm">{problem.matches.length} similar pair(s) found</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#3e3e3e]">
                  {problem.matches.map((match, idx) => (
                    <div key={idx} className="p-4 hover:bg-[#3e3e3e]/30 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          {/* Student 1 */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-400 font-semibold">
                                {match.student1.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{match.student1.name}</p>
                              <p className="text-gray-500 text-xs">{match.student1.usn}</p>
                            </div>
                          </div>

                          {/* Similarity */}
                          <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${getSimilarityColor(match.similarity)}`}>
                            <Percent className="w-4 h-4" />
                            <span className="font-bold">{match.similarity}%</span>
                          </div>

                          {/* Student 2 */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <span className="text-purple-400 font-semibold">
                                {match.student2.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{match.student2.name}</p>
                              <p className="text-gray-500 text-xs">{match.student2.usn}</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCompare(match.submissionId1, match.submissionId2)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#3e3e3e] hover:bg-[#4e4e4e] text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Compare
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-12 text-center">
            <FileCode className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
            <p className="text-gray-400">Enter an assignment ID and click "Check Plagiarism" to analyze submissions</p>
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      {showCompare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#3e3e3e]">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">Code Comparison</h3>
                {comparison && (
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSimilarityColor(comparison.similarity)}`}>
                    {comparison.similarity}% Similar
                  </span>
                )}
              </div>
              <button onClick={() => setShowCompare(false)} className="p-2 hover:bg-[#3e3e3e] rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {compareLoading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff375f]"></div>
              </div>
            ) : comparison && (
              <div className="grid grid-cols-2 divide-x divide-[#3e3e3e] max-h-[calc(90vh-80px)] overflow-auto">
                {/* Submission 1 */}
                <div>
                  <div className="sticky top-0 bg-[#1a1a1a] p-3 border-b border-[#3e3e3e]">
                    <p className="text-white font-medium">{comparison.submission1.student_name}</p>
                    <p className="text-gray-500 text-xs">{comparison.submission1.usn}</p>
                  </div>
                  <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {comparison.submission1.code}
                  </pre>
                </div>

                {/* Submission 2 */}
                <div>
                  <div className="sticky top-0 bg-[#1a1a1a] p-3 border-b border-[#3e3e3e]">
                    <p className="text-white font-medium">{comparison.submission2.student_name}</p>
                    <p className="text-gray-500 text-xs">{comparison.submission2.usn}</p>
                  </div>
                  <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {comparison.submission2.code}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PlagiarismChecker;
