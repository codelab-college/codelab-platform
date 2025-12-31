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
  (error) => Promise.reject(error)
);

// Handle response errors (redirect on 401)
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

// Practice Problems
export const getPracticeProblems = (params) => api.get('/practice', { params });
export const getPracticeProblem = (id) => api.get(`/practice/${id}`);
export const runPracticeCode = (id, data) => api.post(`/practice/${id}/run`, data);
export const submitPracticeCode = (id, data) => api.post(`/practice/${id}/submit`, data);
export const getPracticeStats = () => api.get('/practice/stats/me');
export const saveCode = (problemId, data) => api.post(`/practice/${problemId}/save`, data);

// Badges
export const getBadges = () => api.get('/badges');
export const getEarnedBadges = () => api.get('/badges/earned');
export const checkBadges = () => api.post('/badges/check');
export const getBadgeLeaderboard = () => api.get('/badges/leaderboard');

// Export as object for component imports
export const practiceApi = {
  getPracticeProblems,
  getPracticeProblemById: getPracticeProblem,
  runPracticeCode,
  submitPracticeCode,
  getPracticeStats,
  saveCode,
  getBadges,
  getEarnedBadges,
  checkBadges,
  getBadgeLeaderboard
};

export default api;
