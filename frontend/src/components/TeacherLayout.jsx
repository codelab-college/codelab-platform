import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Users,
  FileText
} from 'lucide-react';

const TeacherLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/teacher/login');
  };

  const navItems = [
    { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/teacher/assignments', icon: BookOpen, label: 'Assignments' },
    { path: '/teacher/contests', icon: Trophy, label: 'Contests' },
    { path: '/teacher/students', icon: Users, label: 'Students' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Top Navigation */}
      <nav className="bg-[#282828] border-b border-[#3e3e3e] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/teacher" className="flex items-center gap-3">
              <div className="p-2 bg-[#ffa116] rounded-lg">
                <GraduationCap className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">CodeLab</h1>
                <p className="text-xs text-gray-400">Teacher Portal</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-[#ffa116] text-black font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-[#3e3e3e]'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.usn}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default TeacherLayout;
