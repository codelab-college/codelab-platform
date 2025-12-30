import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Assignments
export const getAssignments = () => api.get('/assignments');
export const getAssignment = (id) => api.get(`/assignments/${id}`);
export const startAssignment = (id) => api.post(`/assignments/${id}/start`);

// Problems
export const getProblem = (id) => api.get(`/problems/${id}`);
export const getSavedCode = (id) => api.get(`/problems/${id}/code`);

// Submissions
export const runCode = (data) => api.post('/submissions/run', data);
export const submitCode = (data) => api.post('/submissions/submit', data);
export const getSubmissionHistory = (problemId) => api.get(`/submissions/history/${problemId}`);
export const getSubmission = (id) => api.get(`/submissions/${id}`);
export const getSubmissions = () => api.get('/submissions');

// Contests
export const getContests = () => api.get('/contests');
export const getContest = (id) => api.get(`/contests/${id}`);
export const getContestLeaderboard = (id) => api.get(`/contests/${id}/leaderboard`);
export const getLeaderboard = (id) => api.get(`/contests/${id}/leaderboard`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');

export default api;
