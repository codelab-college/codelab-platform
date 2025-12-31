import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, Monitor, CheckCircle, XCircle, AlertTriangle, Shield, Loader2 } from 'lucide-react';

const EnvironmentCheck = ({ problemId, problemTitle, onVerified, onCancel }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('checking'); // checking, ready, error
  const [checks, setChecks] = useState({
    camera: { status: 'pending', message: 'Checking camera access...' },
    microphone: { status: 'pending', message: 'Checking microphone access...' },
    fullscreen: { status: 'pending', message: 'Checking fullscreen support...' }
  });
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    runEnvironmentChecks();
    
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const runEnvironmentChecks = async () => {
    // Check Camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      setCameraStream(stream);
      setChecks(prev => ({
        ...prev,
        camera: { status: 'passed', message: 'Camera access granted' }
      }));
    } catch (err) {
      setChecks(prev => ({
        ...prev,
        camera: { status: 'failed', message: 'Camera access denied. Please enable camera.' }
      }));
    }

    // Check Microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setChecks(prev => ({
        ...prev,
        microphone: { status: 'passed', message: 'Microphone access granted' }
      }));
    } catch (err) {
      setChecks(prev => ({
        ...prev,
        microphone: { status: 'failed', message: 'Microphone access denied. Please enable microphone.' }
      }));
    }

    // Check Fullscreen
    if (document.documentElement.requestFullscreen) {
      setChecks(prev => ({
        ...prev,
        fullscreen: { status: 'passed', message: 'Fullscreen mode supported' }
      }));
    } else {
      setChecks(prev => ({
        ...prev,
        fullscreen: { status: 'failed', message: 'Fullscreen mode not supported' }
      }));
    }

    setStep('ready');
  };

  useEffect(() => {
    const passed = Object.values(checks).every(check => check.status === 'passed');
    setAllPassed(passed);
  }, [checks]);

  const handleStartExam = async () => {
    if (!allPassed) return;
    
    // Request fullscreen on user gesture
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error('Fullscreen request failed:', err);
    }
    
    // Pass the camera stream to the problem page
    onVerified(cameraStream);
  };

  const handleCancel = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    onCancel();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#ffa116] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Secure Exam Environment</h1>
          <p className="text-gray-400">
            Before starting <span className="text-[#ffa116]">{problemTitle}</span>, we need to verify your environment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera Preview */}
          <div className="bg-[#282828] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera Preview
            </h3>
            <div className="aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center">
              {cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-500 text-sm">
                  {checks.camera.status === 'failed' ? 'Camera not available' : 'Loading camera...'}
                </div>
              )}
            </div>
          </div>

          {/* Environment Checks */}
          <div className="bg-[#282828] rounded-lg p-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Environment Checks
            </h3>
            <div className="space-y-4">
              {/* Camera Check */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(checks.camera.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm font-medium">Camera</span>
                  </div>
                  <p className={`text-xs mt-1 ${checks.camera.status === 'failed' ? 'text-red-400' : 'text-gray-400'}`}>
                    {checks.camera.message}
                  </p>
                </div>
              </div>

              {/* Microphone Check */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(checks.microphone.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm font-medium">Microphone</span>
                  </div>
                  <p className={`text-xs mt-1 ${checks.microphone.status === 'failed' ? 'text-red-400' : 'text-gray-400'}`}>
                    {checks.microphone.message}
                  </p>
                </div>
              </div>

              {/* Fullscreen Check */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(checks.fullscreen.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm font-medium">Fullscreen</span>
                  </div>
                  <p className={`text-xs mt-1 ${checks.fullscreen.status === 'failed' ? 'text-red-400' : 'text-gray-400'}`}>
                    {checks.fullscreen.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-[#282828] rounded-lg p-4 mt-6">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ffa116]" />
            Exam Rules
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              Your camera will be on during the entire exam for proctoring
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              The exam will run in fullscreen mode - exiting fullscreen is a violation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              Switching tabs or windows will be recorded as a violation
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              After 3 violations, your exam will be terminated automatically
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ffa116]">•</span>
              Copy/paste and developer tools are disabled during the exam
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleStartExam}
            disabled={!allPassed}
            className={`px-8 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              allPassed
                ? 'bg-[#2cbb5d] hover:bg-[#28a745] text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Shield className="w-4 h-4" />
            {allPassed ? 'Start Secure Exam' : 'Waiting for checks...'}
          </button>
        </div>

        {!allPassed && step === 'ready' && (
          <p className="text-center text-red-400 text-sm mt-4">
            Please grant camera and microphone permissions to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default EnvironmentCheck;
