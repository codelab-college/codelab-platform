import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import EnvironmentCheck from '../components/EnvironmentCheck';
import { getProblem, runCode, submitCode } from '../services/api';
import { 
  Play, Send, Clock, Award, 
  CheckCircle2, XCircle, Code2, FileText, ChevronLeft,
  ChevronRight, Shuffle, Settings, 
  RotateCcw, Maximize2, Copy, Check, Terminal, 
  Camera, AlertTriangle, Shield, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const Problem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Environment check state
  const [showEnvironmentCheck, setShowEnvironmentCheck] = useState(true);
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [violations, setViolations] = useState([]);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const videoRef = useRef(null);
  const maxViolations = 3;
  
  // Problem state
  const [problem, setProblem] = useState(null);
  const [sampleTests, setSampleTests] = useState([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [leftTab, setLeftTab] = useState('description');
  const [bottomTab, setBottomTab] = useState('testcase');
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [savedStatus, setSavedStatus] = useState('Saved');
  const [splitPosition, setSplitPosition] = useState(50);
  const [copied, setCopied] = useState(false);
  const autoSaveTimer = useRef(null);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  // Setup camera video element
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isSecureMode]);

  // Setup secure mode event listeners
  useEffect(() => {
    if (!isSecureMode) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation('Tab switch or window minimized');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isSecureMode) {
        addViolation('Exited fullscreen mode');
        // Re-request fullscreen
        setTimeout(() => {
          document.documentElement.requestFullscreen().catch(console.error);
        }, 100);
      }
    };

    const handleWindowBlur = () => {
      addViolation('Window lost focus');
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You are in a secure exam. Leaving will reset your progress!';
      return e.returnValue;
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    const handleKeyDown = (e) => {
      // Block common shortcuts but allow typing in editor
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        addViolation('Attempted to use blocked keyboard shortcut');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSecureMode]);

  // Auto-save code
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    setSavedStatus('Saving...');
    
    autoSaveTimer.current = setTimeout(() => {
      if (code) {
        localStorage.setItem(`problem_${id}_code`, code);
        localStorage.setItem(`problem_${id}_language`, language);
        setSavedStatus('Saved');
      }
    }, 2000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [code, language, id]);

  // Auto-save custom test input
  useEffect(() => {
    if (customInput !== undefined && customInput !== '') {
      localStorage.setItem(`problem_${id}_customInput`, customInput);
    }
  }, [customInput, id]);

  const addViolation = (message) => {
    const newViolation = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setViolations(prev => {
      const updated = [...prev, newViolation];
      
      if (updated.length >= maxViolations) {
        // Terminate exam
        setTimeout(() => {
          alert(`⚠️ Maximum violations (${maxViolations}) exceeded!\n\nYour exam session has been terminated. You must restart the problem.`);
          endSecureMode();
          navigate('/assignments');
        }, 100);
      } else {
        setShowViolationWarning(true);
        setTimeout(() => setShowViolationWarning(false), 3000);
      }
      
      return updated;
    });
  };

  const fetchProblem = async () => {
    try {
      const response = await getProblem(id);
      setProblem(response.data.problem);
      setSampleTests(response.data.sampleTests);

      const savedCode = localStorage.getItem(`problem_${id}_code`);
      const savedLanguage = localStorage.getItem(`problem_${id}_language`);
      const savedCustomInput = localStorage.getItem(`problem_${id}_customInput`);
      
      if (savedCode) {
        setCode(savedCode);
      }
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      
      // Load saved custom input or default to first sample test input
      if (savedCustomInput) {
        setCustomInput(savedCustomInput);
      } else if (response.data.sampleTests.length > 0) {
        setCustomInput(response.data.sampleTests[0].input);
      }
    } catch (error) {
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleEnvironmentVerified = async (stream) => {
    setCameraStream(stream);
    setShowEnvironmentCheck(false);
    setIsSecureMode(true);
    
    // Note: fullscreen request is handled by the EnvironmentCheck button click
    // which is a user gesture, so we don't need to request it here
  };

  const handleCancelEnvironmentCheck = () => {
    navigate(-1); // Go back
  };

  const endSecureMode = () => {
    setIsSecureMode(false);
    
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setRunning(true);
    setResults(null);
    setConsoleOutput(null);
    setBottomTab('result');

    try {
      const response = await runCode({
        problemId: id,
        code,
        language,
      });

      setResults(response.data.results);
      setConsoleOutput(response.data);
      
      const allPassed = response.data.results.every((r) => r.passed);
      if (allPassed) {
        toast.success('All sample tests passed!');
      }
    } catch (error) {
      console.error('Run error:', error);
      toast.error(error.response?.data?.error || 'Failed to run code');
      setConsoleOutput({ error: error.response?.data?.error || 'Failed to run code' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmitting(true);
    setBottomTab('result');

    try {
      const response = await submitCode({
        problemId: id,
        assignmentId: problem.assignment_id,
        code,
        language,
        isFinal: true,
      });

      const { verdict, score, testCasesPassed, totalTestCases, errorMessage } = response.data;

      setConsoleOutput({
        verdict,
        score,
        testCasesPassed,
        totalTestCases,
        errorMessage,
        isSubmission: true
      });

      if (verdict === 'AC') {
        toast.success(`Accepted! Score: ${score}/${problem.marks}`);
      } else if (verdict === 'WA') {
        toast.error(`Wrong Answer: ${testCasesPassed}/${totalTestCases} tests passed`);
      } else if (verdict === 'TLE') {
        toast.error('Time Limit Exceeded');
      } else if (verdict === 'RE') {
        toast.error('Runtime Error');
      }

      // End secure mode after successful submission
      endSecureMode();
      
      // Navigate back after a delay
      setTimeout(() => {
        navigate(`/assignments/${problem.assignment_id}`);
      }, 2000);

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit code');
      setConsoleOutput({ error: error.response?.data?.error || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-[#00b8a3]',
      medium: 'text-[#ffc01e]',
      hard: 'text-[#ff375f]',
    };
    return colors[difficulty] || 'text-gray-400';
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setSplitPosition(Math.min(Math.max(newPosition, 20), 80));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetCode = () => {
    setCode('');
    localStorage.removeItem(`problem_${id}_code`);
    toast.success('Code reset');
  };

  // Show loading while fetching problem
  if (loading) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show environment check before starting
  if (showEnvironmentCheck && problem) {
    return (
      <EnvironmentCheck
        problemId={id}
        problemTitle={problem.title}
        onVerified={handleEnvironmentVerified}
        onCancel={handleCancelEnvironmentCheck}
      />
    );
  }

  return (
    <div className="h-screen bg-[#1a1a1a] flex flex-col overflow-hidden select-none">
      {/* Violation Warning Toast */}
      {showViolationWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Violation Detected!</p>
              <p className="text-sm text-red-100">
                {violations.length}/{maxViolations} violations - {violations[violations.length - 1]?.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="h-12 bg-[#282828] border-b border-[#3e3e3e] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-8 h-8 bg-[#ffa116] rounded flex items-center justify-center">
              <Code2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold hidden sm:inline">Problem {id}</span>
          </div>
          
          {/* Secure Mode Indicator */}
          {isSecureMode && (
            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-green-900/50 rounded-full border border-green-700">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Secure Mode</span>
            </div>
          )}
          
          {/* Violations Counter */}
          {violations.length > 0 && (
            <div className="flex items-center gap-2 ml-2 px-3 py-1 bg-red-900/50 rounded-full border border-red-700">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">
                {violations.length}/{maxViolations} Violations
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Camera Preview (Small) */}
          {cameraStream && (
            <div className="relative w-20 h-12 rounded overflow-hidden border border-[#3e3e3e] mr-2">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleRunCode}
            disabled={running || submitting}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#3e3e3e] hover:bg-[#4a4a4a] rounded text-sm text-white disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{running ? 'Running...' : 'Run'}</span>
          </button>
          <button
            onClick={handleSubmitCode}
            disabled={running || submitting}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2cbb5d] hover:bg-[#28a745] rounded text-sm text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div style={{ width: `${splitPosition}%` }} className="flex flex-col bg-[#1a1a1a] overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-[#3e3e3e] bg-[#282828]">
            <button
              onClick={() => setLeftTab('description')}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                leftTab === 'description' 
                  ? 'text-white border-white' 
                  : 'text-gray-400 hover:text-gray-200 border-transparent'
              }`}
            >
              <FileText className="w-4 h-4" />
              Description
            </button>
            <button
              onClick={() => setLeftTab('editorial')}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                leftTab === 'editorial' 
                  ? 'text-white border-white' 
                  : 'text-gray-400 hover:text-gray-200 border-transparent'
              }`}
            >
              Editorial
            </button>
            <button
              onClick={() => setLeftTab('solutions')}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                leftTab === 'solutions' 
                  ? 'text-white border-white' 
                  : 'text-gray-400 hover:text-gray-200 border-transparent'
              }`}
            >
              Solutions
            </button>
            <button
              onClick={() => setLeftTab('submissions')}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                leftTab === 'submissions' 
                  ? 'text-white border-white' 
                  : 'text-gray-400 hover:text-gray-200 border-transparent'
              }`}
            >
              Submissions
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-6">
            {leftTab === 'description' && (
              <div className="text-gray-200">
                {/* Problem Title */}
                <div className="mb-4">
                  <h1 className="text-xl font-semibold text-white mb-2">
                    {id}. {problem.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </span>
                    <span className="flex items-center text-sm text-gray-400">
                      <Award className="w-4 h-4 mr-1" />
                      {problem.marks} marks
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</p>
                </div>

                {/* Input Format */}
                {problem.input_format && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-white mb-2">Input Format</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{problem.input_format}</p>
                  </div>
                )}

                {/* Output Format */}
                {problem.output_format && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-white mb-2">Output Format</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{problem.output_format}</p>
                  </div>
                )}

                {/* Examples */}
                {sampleTests.map((test, index) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-base font-semibold text-white mb-3">Example {index + 1}:</h3>
                    <div className="bg-[#282828] rounded-lg overflow-hidden">
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-400">Input:</span>
                            <button 
                              onClick={() => copyToClipboard(test.input)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <pre className="text-sm text-gray-200 font-mono bg-[#1e1e1e] p-3 rounded">
                            {test.input}
                          </pre>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-400">Output:</span>
                          <pre className="text-sm text-gray-200 font-mono bg-[#1e1e1e] p-3 rounded mt-1">
                            {test.expected_output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                {problem.constraints && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-white mb-2">Constraints:</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {problem.constraints.split('\n').map((constraint, i) => (
                        <li key={i} className="font-mono">{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Time and Memory Limits */}
                <div className="flex items-center gap-6 text-sm text-gray-400 pt-4 border-t border-[#3e3e3e]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Time: {problem.time_limit}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span>Memory: {problem.memory_limit}MB</span>
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'editorial' && (
              <div className="text-gray-400 text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Editorial not available for this problem</p>
              </div>
            )}

            {leftTab === 'solutions' && (
              <div className="text-gray-400 text-center py-12">
                <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No community solutions yet</p>
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className="text-gray-400 text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>View your submission history in the Submissions page</p>
              </div>
            )}
          </div>
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 bg-[#3e3e3e] hover:bg-[#ffa116] cursor-col-resize flex-shrink-0 transition-colors"
        />

        {/* Right Panel - Code Editor */}
        <div style={{ width: `${100 - splitPosition}%` }} className="flex flex-col bg-[#1a1a1a] overflow-hidden">
          {/* Code Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#282828] border-b border-[#3e3e3e]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Code2 className="w-4 h-4" />
                Code
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#3e3e3e] text-gray-200 text-sm px-3 py-1.5 rounded border-none outline-none cursor-pointer hover:bg-[#4a4a4a]"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
              </select>
              <div className="flex items-center gap-1 ml-2">
                <button onClick={resetCode} className="p-1.5 hover:bg-[#3e3e3e] rounded text-gray-400 hover:text-white" title="Reset Code">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-[#3e3e3e] rounded text-gray-400 hover:text-white" title="Settings">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              height="100%"
            />
          </div>

          {/* Bottom Panel - Testcase / Result */}
          <div className="h-48 border-t border-[#3e3e3e] flex flex-col bg-[#1a1a1a]">
            {/* Bottom Tabs */}
            <div className="flex items-center justify-between px-3 border-b border-[#3e3e3e] bg-[#282828]">
              <div className="flex items-center">
                <button
                  onClick={() => setBottomTab('testcase')}
                  className={`px-3 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    bottomTab === 'testcase' 
                      ? 'text-white border-white' 
                      : 'text-gray-400 hover:text-gray-200 border-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Testcase
                </button>
                <button
                  onClick={() => setBottomTab('result')}
                  className={`px-3 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    bottomTab === 'result' 
                      ? 'text-white border-white' 
                      : 'text-gray-400 hover:text-gray-200 border-transparent'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  Test Result
                </button>
              </div>
              <span className="text-xs text-gray-500">{savedStatus}</span>
            </div>

            {/* Bottom Content */}
            <div className="flex-1 overflow-auto p-3">
              {bottomTab === 'testcase' && (
                <div>
                  {/* Test Case Selector */}
                  <div className="flex items-center gap-2 mb-3">
                    {sampleTests.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedTestCase(index);
                          setCustomInput(sampleTests[index].input);
                        }}
                        className={`px-3 py-1 text-sm rounded ${
                          selectedTestCase === index
                            ? 'bg-[#3e3e3e] text-white'
                            : 'text-gray-400 hover:text-white hover:bg-[#3e3e3e]'
                        }`}
                      >
                        Case {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  {/* Input */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Input:</label>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="w-full h-20 bg-[#282828] text-gray-200 text-sm font-mono p-2 rounded border border-[#3e3e3e] resize-none focus:outline-none focus:border-[#ffa116]"
                      placeholder="Enter custom input..."
                    />
                  </div>
                </div>
              )}

              {bottomTab === 'result' && (
                <div>
                  {!results && !consoleOutput && (
                    <div className="text-gray-500 text-sm">
                      Run your code to see results here
                    </div>
                  )}

                  {consoleOutput?.error && (
                    <div className="bg-red-900/20 border border-red-800 rounded p-3">
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Error</span>
                      </div>
                      <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">{consoleOutput.error}</pre>
                    </div>
                  )}

                  {consoleOutput?.isSubmission && (
                    <div className={`rounded p-3 ${
                      consoleOutput.verdict === 'AC' 
                        ? 'bg-green-900/20 border border-green-800' 
                        : 'bg-red-900/20 border border-red-800'
                    }`}>
                      <div className={`flex items-center gap-2 mb-2 ${
                        consoleOutput.verdict === 'AC' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {consoleOutput.verdict === 'AC' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        <span className="font-semibold text-lg">
                          {consoleOutput.verdict === 'AC' && 'Accepted'}
                          {consoleOutput.verdict === 'WA' && 'Wrong Answer'}
                          {consoleOutput.verdict === 'TLE' && 'Time Limit Exceeded'}
                          {consoleOutput.verdict === 'RE' && 'Runtime Error'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <span>Tests Passed: {consoleOutput.testCasesPassed}/{consoleOutput.totalTestCases}</span>
                        <span className="mx-2">•</span>
                        <span>Score: {consoleOutput.score}/{problem.marks}</span>
                      </div>
                    </div>
                  )}

                  {results && !consoleOutput?.isSubmission && (
                    <div className="space-y-3">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className={`rounded p-3 ${
                            result.passed 
                              ? 'bg-green-900/20 border border-green-800' 
                              : 'bg-red-900/20 border border-red-800'
                          }`}
                        >
                          <div className={`flex items-center gap-2 mb-2 ${
                            result.passed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {result.passed ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span className="font-medium text-sm">
                              Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                            </span>
                            {result.executionTime && (
                              <span className="text-xs text-gray-500 ml-auto">
                                {result.executionTime}ms
                              </span>
                            )}
                          </div>
                          
                          {!result.passed && (
                            <div className="text-xs space-y-2 font-mono">
                              <div>
                                <span className="text-gray-400">Expected: </span>
                                <span className="text-gray-200">{result.expectedOutput}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Output: </span>
                                <span className="text-red-300">{result.actualOutput || result.error}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problem;
