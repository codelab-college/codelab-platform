import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSubmissions } from '../services/api';
import { Code, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await getSubmissions();
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      // API might not exist yet
      console.log('Submissions API not available');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    const colors = {
      AC: 'text-[#00b8a3]',
      WA: 'text-[#ff375f]',
      TLE: 'text-[#ffc01e]',
      RE: 'text-[#ff375f]',
    };
    return colors[verdict] || 'text-gray-400';
  };

  const getVerdictIcon = (verdict) => {
    if (verdict === 'AC') return <CheckCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.verdict === filter;
  });

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code className="w-7 h-7 text-[#ffa116]" />
            My Submissions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View your submission history</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {['all', 'AC', 'WA', 'TLE', 'RE'].map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === v
                  ? 'bg-[#ffa116] text-black'
                  : 'bg-white dark:bg-[#282828] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3e3e3e] border border-gray-200 dark:border-[#3e3e3e]'
              }`}
            >
              {v === 'all' ? 'All' : v}
            </button>
          ))}
        </div>

        {/* Submissions Table */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#3e3e3e]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Problem
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#3e3e3e]">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <Code className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start solving problems to see your submissions here</p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-2 ${getVerdictColor(submission.verdict)}`}>
                        {getVerdictIcon(submission.verdict)}
                        <span className="font-medium">{submission.verdict}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/submissions/${submission.id}`}
                        className="text-[#ffa116] hover:text-[#ffb84d] font-medium"
                      >
                        {submission.problem_title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{submission.language}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{submission.score}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Submissions;
