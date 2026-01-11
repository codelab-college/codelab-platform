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
import Practice from './pages/Practice';
import PracticeProblem from './pages/PracticeProblem';
import Badges from './pages/Badges';
import Leaderboard from './pages/Leaderboard';

// Teacher Pages
import TeacherLayout from './components/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AssignmentsList from './pages/teacher/AssignmentsList';
import AssignmentForm from './pages/teacher/AssignmentForm';
import TeacherAssignmentDetail from './pages/teacher/AssignmentDetail';
import AssignmentSubmissions from './pages/teacher/AssignmentSubmissions';
import StudentSearch from './pages/teacher/StudentSearch';
import Layout from './components/Layout';

// Admin Pages
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherManagement from './pages/admin/TeacherManagement';
import StudentManagement from './pages/admin/StudentManagement';
import Reports from './pages/admin/Reports';
import PlagiarismChecker from './pages/admin/PlagiarismChecker';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect old login pages to main login */}
            <Route path="/teacher/login" element={<Navigate to="/login" replace />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

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

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <TeacherManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <StudentManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Reports />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/plagiarism"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <PlagiarismChecker />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
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
              path="/practice"
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice/:id"
              element={
                <ProtectedRoute>
                  <PracticeProblem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/badges"
              element={
                <ProtectedRoute>
                  <Badges />
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
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UnderDevelopment feature="Student Settings" />
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
