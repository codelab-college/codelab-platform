import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa116]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login based on required role
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to={requiredRole === 'teacher' ? '/teacher/login' : '/login'} replace />;
  }

  // Check role if specified
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate portal based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user?.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
