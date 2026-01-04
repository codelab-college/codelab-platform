import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminLogin = () => {
  const [usn, setUsn] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use dedicated admin login endpoint
      console.log('Attempting admin login with:', usn);
      const response = await axios.post('/api/admin/login', { usn, password });
      console.log('Admin login response:', response.data);
      const { token, user } = response.data;

      if (user.role !== 'admin') {
        toast.error('Access denied. Admin only.');
        setLoading(false);
        return;
      }

      // Store token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff375f] rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Login</h1>
          <p className="text-gray-400 mt-2">CodeLab Platform Administration</p>
        </div>

        <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Admin ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  placeholder="ADMIN001"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:border-[#ff375f] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#1a1a1a] border border-[#3e3e3e] rounded-lg text-white placeholder-gray-500 focus:border-[#ff375f] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ff375f] hover:bg-[#ff4d6d] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Not an admin?{' '}
          <a href="/login" className="text-[#ff375f] hover:underline">
            Student Login
          </a>
          {' • '}
          <a href="/teacher/login" className="text-[#ffa116] hover:underline">
            Teacher Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
