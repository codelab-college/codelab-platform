import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getPracticeProblems, getPracticeStats } from '../services/practiceApi';
import { 
  Code2, Search, Filter, CheckCircle, Clock, 
  TrendingUp, Target, Zap, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Practice = () => {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, [difficulty, selectedTag]);

  const fetchProblems = async () => {
    try {
      const response = await getPracticeProblems({ difficulty, tag: selectedTag });
      setProblems(response.data.problems);
      setTags(response.data.tags || []);
    } catch (error) {
      toast.error('Failed to load practice problems');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getPracticeStats();
      setStats(response.data.stats);
    } catch (error) {
      // Stats optional
    }
  };

  const getDifficultyColor = (diff) => {
    const colors = {
      easy: 'text-[#00b8a3]',
      medium: 'text-[#ffc01e]',
      hard: 'text-[#ff375f]',
    };
    return colors[diff] || 'text-gray-400';
  };

  const getDifficultyBg = (diff) => {
    const colors = {
      easy: 'bg-[#00b8a3]/20',
      medium: 'bg-[#ffc01e]/20',
      hard: 'bg-[#ff375f]/20',
    };
    return colors[diff] || 'bg-gray-400/20';
  };

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-7 h-7 text-[#ffa116]" />
              Practice
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sharpen your skills with practice problems</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Problems Solved</p>
                  <p className="text-2xl font-bold text-[#00b8a3] mt-1">{stats.solved || 0}</p>
                </div>
                <div className="w-12 h-12 bg-[#00b8a3]/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#00b8a3]" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Problems Attempted</p>
                  <p className="text-2xl font-bold text-[#ffa116] mt-1">{stats.attempted || 0}</p>
                </div>
                <div className="w-12 h-12 bg-[#ffa116]/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#ffa116]" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total_submissions || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3e3e3e] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#ffa116] focus:outline-none"
              />
            </div>

            {/* Difficulty Filter */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3e3e3e] rounded-lg text-gray-900 dark:text-white focus:border-[#ffa116] focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* Tag Filter */}
            {tags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#3e3e3e] rounded-lg text-gray-900 dark:text-white focus:border-[#ffa116] focus:outline-none"
              >
                <option value="">All Topics</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Problem List */}
        <div className="bg-white dark:bg-[#282828] border border-gray-200 dark:border-[#3e3e3e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Title</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Difficulty</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Acceptance</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#3e3e3e]">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <Code2 className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400">No practice problems found</p>
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr key={problem.id} className="hover:bg-gray-50 dark:hover:bg-[#3e3e3e]/30 transition-colors">
                      <td className="px-4 py-4">
                        {problem.is_solved ? (
                          <CheckCircle className="w-5 h-5 text-[#00b8a3]" />
                        ) : problem.attempt_count > 0 ? (
                          <div className="w-5 h-5 rounded-full border-2 border-[#ffc01e]" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-[#3e3e3e]" />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Link to={`/practice/${problem.id}`} className="text-gray-900 dark:text-white hover:text-[#ffa116] font-medium transition-colors">
                          {problem.title}
                        </Link>
                        {problem.tags && (
                          <div className="flex gap-1 mt-1">
                            {problem.tags.split(',').slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-[#3e3e3e] text-gray-500 dark:text-gray-400 rounded text-xs">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBg(problem.difficulty)} ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                        {problem.total_solved || 0} solved
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/practice/${problem.id}`}
                          className="inline-flex items-center gap-1 text-[#ffa116] hover:underline"
                        >
                          Solve <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Practice;
