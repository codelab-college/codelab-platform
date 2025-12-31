import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Play, Send, CheckCircle, XCircle, Clock, 
  AlertCircle, ChevronDown, ChevronUp, Code2, BookOpen,
  Loader2, RotateCcw, Save, Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import CodeEditor from '../components/CodeEditor';
import { practiceApi } from '../services/practiceApi';

export default function PracticeProblem() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showHints, setShowHints] = useState(false);
  const [saving, setSaving] = useState(false);

  const defaultCode = {
    javascript: `// Write your solution here
function solution(input) {
  // Parse input and solve the problem
  return result;
}

// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const result = solution(lines);
  console.log(result);
});`,
    python: `# Write your solution here
def solution(input_lines):
    # Parse input and solve the problem
    return result

# Read input from stdin
import sys
lines = sys.stdin.read().strip().split('\\n')
result = solution(lines)
print(result)`,
    cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}`,
    java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        
        sc.close();
    }
}`
  };

  useEffect(() => {
    fetchProblem();
  }, [id]);

  useEffect(() => {
    // Reset code when language changes (if no saved code)
    if (problem && !problem.savedCode?.[language]) {
      setCode(defaultCode[language] || defaultCode.javascript);
    }
  }, [language]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await practiceApi.getPracticeProblemById(id);
      const data = response.data;
      
      // Backend returns { problem, testCases, savedCode, submissions }
      setProblem({
        ...data.problem,
        sampleTestCases: data.testCases || []
      });
      
      // Load saved code or default
      if (data.savedCode?.code) {
        setCode(data.savedCode.code);
        if (data.savedCode.language) {
          setLanguage(data.savedCode.language);
        }
      } else {
        setCode(defaultCode[language] || defaultCode.javascript);
      }
    } catch (error) {
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    try {
      setRunning(true);
      setResults(null);
      
      const response = await practiceApi.runPracticeCode(id, { code, language });
      setResults(response.data);
      
      if (response.data.allPassed) {
        toast.success('All sample tests passed!');
      } else {
        toast.error('Some tests failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to run code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setResults(null);
      
      const response = await practiceApi.submitPracticeCode(id, { code, language });
      setResults(response.data);
      
      if (response.data.verdict === 'Accepted') {
        toast.success('🎉 Problem solved! Great job!');
        // Check for new badges
        const badgeResponse = await practiceApi.checkBadges();
        if (badgeResponse.data.newBadges?.length > 0) {
          badgeResponse.data.newBadges.forEach(badge => {
            toast.success(`🏆 New badge: ${badge.name}!`, { duration: 5000 });
          });
        }
      } else {
        toast.error(`Verdict: ${response.data.verdict}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCode = async () => {
    try {
      setSaving(true);
      await practiceApi.saveCode(id, { code, language });
      toast.success('Code saved!');
    } catch (error) {
      toast.error('Failed to save code');
    } finally {
      setSaving(false);
    }
  };

  const resetCode = () => {
    setCode(defaultCode[language] || defaultCode.javascript);
    toast.success('Code reset to default');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'Accepted': return 'text-green-500 bg-green-500/10';
      case 'Wrong Answer': return 'text-red-500 bg-red-500/10';
      case 'Time Limit Exceeded': return 'text-yellow-500 bg-yellow-500/10';
      case 'Runtime Error': return 'text-orange-500 bg-orange-500/10';
      case 'Compilation Error': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen bg-[#1a1a1a]">
          <Loader2 className="w-8 h-8 text-[#ffa116] animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!problem) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen bg-[#1a1a1a]">
          <AlertCircle className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-400">Problem not found</p>
          <Link to="/practice" className="mt-4 text-[#ffa116] hover:underline">
            Back to Practice
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header */}
        <div className="bg-[#282828] border-b border-[#3e3e3e] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/practice" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-white">{problem.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  {problem.tags && (
                    <div className="flex gap-1">
                      {problem.tags.split(',').slice(0, 3).map((tag, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 bg-[#3e3e3e] text-gray-400 text-xs rounded"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#3e3e3e] text-white px-3 py-1.5 rounded text-sm border border-[#4a4a4a] focus:border-[#ffa116] focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
              
              <button
                onClick={resetCode}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#3e3e3e] rounded transition-colors"
                title="Reset Code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleSaveCode}
                disabled={saving}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#3e3e3e] rounded transition-colors disabled:opacity-50"
                title="Save Code"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel - Problem Description */}
          <div className="w-1/2 border-r border-[#3e3e3e] overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-[#3e3e3e] sticky top-0 bg-[#1a1a1a] z-10">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-[#ffa116] border-b-2 border-[#ffa116]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Description
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'submissions'
                    ? 'text-[#ffa116] border-b-2 border-[#ffa116]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Terminal className="w-4 h-4 inline mr-2" />
                Results
              </button>
            </div>

            {activeTab === 'description' && (
              <div className="p-6">
                {/* Problem Statement */}
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-300 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, '<br/>') }}
                  />
                </div>

                {/* Sample Test Cases */}
                {problem.sampleTestCases?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-white font-medium mb-4">Examples</h3>
                    {problem.sampleTestCases.map((tc, index) => (
                      <div key={index} className="mb-6 bg-[#282828] rounded-lg p-4">
                        <div className="mb-3">
                          <span className="text-gray-400 text-sm">Input:</span>
                          <pre className="mt-1 bg-[#1a1a1a] p-3 rounded text-sm text-gray-300 overflow-x-auto">
                            {tc.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Output:</span>
                          <pre className="mt-1 bg-[#1a1a1a] p-3 rounded text-sm text-gray-300 overflow-x-auto">
                            {tc.expected_output}
                          </pre>
                        </div>
                        {tc.explanation && (
                          <div className="mt-3">
                            <span className="text-gray-400 text-sm">Explanation:</span>
                            <p className="mt-1 text-gray-400 text-sm">{tc.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div className="mt-8">
                    <h3 className="text-white font-medium mb-3">Constraints</h3>
                    <div className="bg-[#282828] rounded-lg p-4">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                        {problem.constraints}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Hints */}
                {problem.hints && (
                  <div className="mt-8">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-[#ffa116] hover:text-[#ffb84d] transition-colors"
                    >
                      {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {showHints ? 'Hide Hints' : 'Show Hints'}
                    </button>
                    {showHints && (
                      <div className="mt-3 bg-[#282828] rounded-lg p-4 border-l-4 border-[#ffa116]">
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                          {problem.hints}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="p-6">
                {results ? (
                  <div>
                    {/* Verdict */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${getVerdictColor(results.verdict)}`}>
                      {results.verdict === 'Accepted' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span className="font-medium">{results.verdict || 'Test Results'}</span>
                    </div>

                    {/* Stats */}
                    {results.testsPassed !== undefined && (
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#282828] rounded-lg p-4">
                          <p className="text-gray-400 text-sm">Tests Passed</p>
                          <p className="text-2xl font-bold text-white">
                            {results.testsPassed}/{results.totalTests}
                          </p>
                        </div>
                        <div className="bg-[#282828] rounded-lg p-4">
                          <p className="text-gray-400 text-sm">Score</p>
                          <p className="text-2xl font-bold text-[#ffa116]">
                            {results.score || 0}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Test Case Results */}
                    {results.results && (
                      <div className="space-y-3">
                        <h3 className="text-white font-medium">Test Cases</h3>
                        {results.results.map((result, index) => (
                          <div 
                            key={index}
                            className={`bg-[#282828] rounded-lg p-4 border-l-4 ${
                              result.passed ? 'border-green-500' : 'border-red-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium">
                                Test Case {index + 1}
                              </span>
                              {result.passed ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            
                            {result.input && (
                              <div className="mb-2">
                                <span className="text-gray-400 text-xs">Input:</span>
                                <pre className="mt-1 bg-[#1a1a1a] p-2 rounded text-xs text-gray-300 overflow-x-auto">
                                  {result.input}
                                </pre>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-gray-400 text-xs">Expected:</span>
                                <pre className="mt-1 bg-[#1a1a1a] p-2 rounded text-xs text-gray-300 overflow-x-auto">
                                  {result.expected}
                                </pre>
                              </div>
                              <div>
                                <span className="text-gray-400 text-xs">Your Output:</span>
                                <pre className={`mt-1 bg-[#1a1a1a] p-2 rounded text-xs overflow-x-auto ${
                                  result.passed ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {result.actual || '(no output)'}
                                </pre>
                              </div>
                            </div>
                            
                            {result.error && (
                              <div className="mt-2">
                                <span className="text-red-400 text-xs">Error:</span>
                                <pre className="mt-1 bg-red-500/10 p-2 rounded text-xs text-red-400 overflow-x-auto">
                                  {result.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Compilation Error */}
                    {results.error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <h3 className="text-red-500 font-medium mb-2">Error</h3>
                        <pre className="text-red-400 text-sm whitespace-pre-wrap overflow-x-auto">
                          {results.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Terminal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Run or submit your code to see results</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                height="100%"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-[#282828] border-t border-[#3e3e3e] px-4 py-3 flex justify-end gap-3">
              <button
                onClick={handleRun}
                disabled={running || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#3e3e3e] text-white rounded hover:bg-[#4a4a4a] transition-colors disabled:opacity-50"
              >
                {running ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#ffa116] text-black font-medium rounded hover:bg-[#ffb84d] transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
