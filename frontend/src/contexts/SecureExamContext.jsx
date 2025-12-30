import { createContext, useContext, useState, useRef, useCallback } from 'react';

const SecureExamContext = createContext(null);

export const useSecureExam = () => {
  const context = useContext(SecureExamContext);
  if (!context) {
    throw new Error('useSecureExam must be used within a SecureExamProvider');
  }
  return context;
};

export const SecureExamProvider = ({ children }) => {
  const [isExamMode, setIsExamMode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [violations, setViolations] = useState([]);
  const [cameraStream, setCameraStream] = useState(null);
  const [currentProblemId, setCurrentProblemId] = useState(null);
  const violationCountRef = useRef(0);
  const maxViolations = 3;

  const startExam = useCallback(async (problemId) => {
    setCurrentProblemId(problemId);
    setIsExamMode(true);
    setViolations([]);
    violationCountRef.current = 0;
    
    // Request fullscreen
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }

    // Add event listeners for violations
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Disable right-click
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
  }, []);

  const endExam = useCallback(() => {
    setIsExamMode(false);
    setIsVerified(false);
    setCurrentProblemId(null);
    
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }

    // Remove event listeners
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('contextmenu', preventContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
  }, [cameraStream]);

  const handleVisibilityChange = () => {
    if (document.hidden) {
      addViolation('Tab switch detected');
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && isExamMode) {
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
    e.returnValue = 'You are in an exam. Leaving will reset your progress. Are you sure?';
    return e.returnValue;
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
  };

  const handleKeyDown = (e) => {
    // Block common shortcuts
    if (
      (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 's')) ||
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && e.key === 'I') ||
      (e.ctrlKey && e.shiftKey && e.key === 'J') ||
      e.key === 'PrintScreen'
    ) {
      e.preventDefault();
      addViolation('Attempted to use blocked keyboard shortcut');
    }
  };

  const addViolation = useCallback((message) => {
    violationCountRef.current += 1;
    const violation = {
      id: Date.now(),
      message,
      timestamp: new Date().toISOString(),
      count: violationCountRef.current
    };
    setViolations(prev => [...prev, violation]);

    // Check if max violations exceeded
    if (violationCountRef.current >= maxViolations) {
      // Force end exam - user must restart
      alert(`⚠️ Maximum violations (${maxViolations}) exceeded!\n\nYour exam session has been terminated. You must restart the problem.`);
      endExam();
      window.location.href = '/assignments';
    }
  }, [endExam]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      return { success: true, stream };
    } catch (err) {
      console.error('Camera access denied:', err);
      return { success: false, error: err.message };
    }
  };

  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just need to verify access
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const verifyEnvironment = async () => {
    const cameraResult = await initializeCamera();
    const micResult = await checkMicrophone();
    
    if (cameraResult.success && micResult.success) {
      setIsVerified(true);
      return { success: true };
    }
    
    return {
      success: false,
      camera: cameraResult.success,
      microphone: micResult.success,
      errors: {
        camera: cameraResult.error,
        microphone: micResult.error
      }
    };
  };

  const value = {
    isExamMode,
    isVerified,
    violations,
    cameraStream,
    currentProblemId,
    violationCount: violationCountRef.current,
    maxViolations,
    startExam,
    endExam,
    verifyEnvironment,
    initializeCamera,
    checkMicrophone,
    addViolation
  };

  return (
    <SecureExamContext.Provider value={value}>
      {children}
    </SecureExamContext.Provider>
  );
};

export default SecureExamContext;
