import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import Problem from './pages/Problem';
import Submissions from './pages/Submissions';
import SubmissionDetail from './pages/SubmissionDetail';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments"
              element={
                <ProtectedRoute>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignments/:id"
              element={
                <ProtectedRoute>
                  <AssignmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/problems/:id"
              element={
                <ProtectedRoute>
                  <Problem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submissions"
              element={
                <ProtectedRoute>
                  <Submissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submissions/:id"
              element={
                <ProtectedRoute>
                  <SubmissionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contests"
              element={
                <ProtectedRoute>
                  <Contests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contests/:id"
              element={
                <ProtectedRoute>
                  <ContestDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contests/:id/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
