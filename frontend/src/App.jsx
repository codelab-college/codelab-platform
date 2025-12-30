import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import UnderDevelopment from './components/UnderDevelopment';

// Student Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import Problem from './pages/Problem';
import Submissions from './pages/Submissions';
import SubmissionDetail from './pages/SubmissionDetail';

// Teacher Pages
import TeacherLogin from './pages/teacher/TeacherLogin';
import TeacherLayout from './components/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AssignmentsList from './pages/teacher/AssignmentsList';
import AssignmentForm from './pages/teacher/AssignmentForm';
import TeacherAssignmentDetail from './pages/teacher/AssignmentDetail';
import AssignmentSubmissions from './pages/teacher/AssignmentSubmissions';
import StudentSearch from './pages/teacher/StudentSearch';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <TeacherDashboard />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <AssignmentsList />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments/create"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <AssignmentForm />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments/:id/edit"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <AssignmentForm />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments/:id/submissions"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <AssignmentSubmissions />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/assignments/:id"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <TeacherAssignmentDetail />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <StudentSearch />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/contests"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <UnderDevelopment feature="Contests" />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/contests/create"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherLayout>
                    <UnderDevelopment feature="Create Contest" />
                  </TeacherLayout>
                </ProtectedRoute>
              }
            />

            {/* Student protected routes */}
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
                  <Layout>
                    <UnderDevelopment feature="Contests" />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contests/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UnderDevelopment feature="Contest Details" />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contests/:id/leaderboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UnderDevelopment feature="Contest Leaderboard" />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
