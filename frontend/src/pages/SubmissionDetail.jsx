import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSubmission } from '../services/api';
import { ArrowLeft, Clock, Award, CheckCircle, XCircle, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SubmissionDetail = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await getSubmission(id);
      setSubmission(response.data.submission);
    } catch (error) {
      toast.error('Failed to load submission');
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

  const getVerdictBg = (verdict) => {
    const colors = {
      AC: 'bg-[#00b8a3]/20 border-[#00b8a3]/30',
      WA: 'bg-[#ff375f]/20 border-[#ff375f]/30',
      TLE: 'bg-[#ffc01e]/20 border-[#ffc01e]/30',
      RE: 'bg-[#ff375f]/20 border-[#ff375f]/30',
    };
    return colors[verdict] || 'bg-gray-800 border-gray-700';
  };

  const getVerdictText = (verdict) => {
    const texts = {
      AC: 'Accepted',
      WA: 'Wrong Answer',
      TLE: 'Time Limit Exceeded',
      RE: 'Runtime Error',
    };
    return texts[verdict] || verdict;
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

  if (!submission) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-400">Submission not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          to={`/problems/${submission.problem_id}`}
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Problem
        </Link>

        {/* Verdict Banner */}
        <div className={`rounded-xl border p-6 ${getVerdictBg(submission.verdict)}`}>
          <div className="flex items-center gap-4">
            {submission.verdict === 'AC' ? (
              <CheckCircle className={`w-12 h-12 ${getVerdictColor(submission.verdict)}`} />
            ) : (
              <XCircle className={`w-12 h-12 ${getVerdictColor(submission.verdict)}`} />
            )}
            <div>
              <h1 className={`text-2xl font-bold ${getVerdictColor(submission.verdict)}`}>
                {getVerdictText(submission.verdict)}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Submission #{submission.id} • {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Problem</p>
            <p className="font-medium text-gray-900 dark:text-white">{submission.problem_title}</p>
          </div>
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Assignment</p>
            <p className="font-medium text-gray-900 dark:text-white">{submission.assignment_title}</p>
          </div>
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Score</p>
            <p className="font-medium text-[#ffa116] text-xl">{submission.score}</p>
          </div>
          <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Language</p>
            <p className="font-medium text-gray-900 dark:text-white capitalize">{submission.language}</p>
          </div>
        </div>

        {/* Code */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[#3e3e3e] flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#ffa116]" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Submitted Code</h3>
          </div>
          <pre className="bg-gray-50 dark:bg-[#1a1a1a] text-gray-800 dark:text-gray-100 p-4 overflow-x-auto text-sm font-mono">
            <code>{submission.code}</code>
          </pre>
        </div>

        {/* Error Message */}
        {submission.error_message && (
          <div className="bg-[#ff375f]/10 border border-[#ff375f]/30 rounded-xl p-4">
            <h3 className="font-semibold text-[#ff375f] mb-2">Error Output</h3>
            <pre className="text-red-400 dark:text-red-300 text-sm font-mono whitespace-pre-wrap">
              {submission.error_message}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubmissionDetail;
