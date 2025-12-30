import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login based on required role
    return <Navigate to={requiredRole === 'teacher' ? '/teacher/login' : '/login'} replace />;
  }

  // Check role if specified
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect teacher to teacher portal, student to student portal
    return <Navigate to={user?.role === 'teacher' ? '/teacher' : '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
