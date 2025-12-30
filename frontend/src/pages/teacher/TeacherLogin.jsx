import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Code2, Eye, EyeOff, Loader2, GraduationCap } from 'lucide-react';

const TeacherLogin = () => {
  const [usn, setUsn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(usn, password);
    
    if (success) {
      // Check if user is actually a teacher
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'teacher') {
          navigate('/teacher');
        } else {
          localStorage.removeItem('token');
          alert('This account is not a teacher account. Please use the student login.');
        }
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffa116]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ffa116]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ffa116] rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white">CodeLab</h1>
          <p className="text-gray-400 mt-2">Teacher Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#282828] border border-[#3e3e3e] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Teacher Login</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="usn" className="block text-sm font-medium text-gray-300 mb-2">
                Teacher ID
              </label>
              <input
                id="usn"
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa116] transition-colors"
                placeholder="Enter your Teacher ID"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ffa116] transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg">
            <p className="text-sm font-medium text-gray-300 mb-2">Demo Credentials:</p>
            <p className="text-sm text-gray-400">
              Teacher ID: <span className="font-mono font-semibold text-[#ffa116]">TCSE001</span>
            </p>
            <p className="text-sm text-gray-400">
              Password: <span className="font-mono font-semibold text-[#ffa116]">password123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Teacher Portal • For Educational Use Only
        </p>
      </div>
    </div>
  );
};

export default TeacherLogin;
