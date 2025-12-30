import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Teacher API
export const teacherAPI = {
  // Dashboard
  getDashboard: () => api.get('/teacher/dashboard'),

  // Assignment Management
  getAssignments: () => api.get('/teacher/assignments'),
  getAssignment: (id) => api.get(`/teacher/assignments/${id}`),
  createAssignment: (data) => api.post('/teacher/assignments', data),
  updateAssignment: (id, data) => api.put(`/teacher/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/teacher/assignments/${id}`),

  // Problem Management
  createProblem: (data) => api.post('/teacher/problems', data),
  getProblem: (id) => api.get(`/teacher/problems/${id}`),
  updateProblem: (id, data) => api.put(`/teacher/problems/${id}`, data),
  deleteProblem: (id) => api.delete(`/teacher/problems/${id}`),

  // Test Case Management
  createTestCase: (data) => api.post('/teacher/test-cases', data),
  updateTestCase: (id, data) => api.put(`/teacher/test-cases/${id}`, data),
  deleteTestCase: (id) => api.delete(`/teacher/test-cases/${id}`),

  // Submission Review
  getAssignmentSubmissions: (assignmentId) => 
    api.get(`/teacher/assignments/${assignmentId}/submissions`),
  getAssignmentStudents: (assignmentId) => 
    api.get(`/teacher/assignments/${assignmentId}/students`),

  // Student Profile
  searchStudent: (usn) => api.get(`/teacher/students/search?usn=${usn}`),

  // Contest Management
  getContests: () => api.get('/teacher/contests'),
  createContest: (data) => api.post('/teacher/contests', data),
  updateContest: (id, data) => api.put(`/teacher/contests/${id}`, data),
  getContestLeaderboard: (id) => api.get(`/teacher/contests/${id}/leaderboard`),
};

export default api;
