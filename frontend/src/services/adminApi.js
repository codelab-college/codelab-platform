import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin',
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard
export const getAdminDashboard = () => api.get('/dashboard');

// Teachers
export const getTeachers = () => api.get('/teachers');
export const createTeacher = (data) => api.post('/teachers', data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// Students
export const getStudents = (params) => api.get('/students', { params });
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const batchImportStudents = (students) => api.post('/students/batch', { students });

// Plagiarism
export const checkPlagiarism = (assignmentId, problemId) => 
  api.get(`/plagiarism/${assignmentId}`, { params: { problemId } });
export const compareSumbissions = (id1, id2) => api.get(`/plagiarism/compare/${id1}/${id2}`);

// Reports
export const getAssignmentReport = (id) => api.get(`/reports/assignment/${id}`);
export const getStudentReport = (id) => api.get(`/reports/student/${id}`);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (settings) => api.put('/settings', { settings });

export default api;
