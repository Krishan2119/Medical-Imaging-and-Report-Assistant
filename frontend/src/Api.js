import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
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

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const patientsAPI = {
  getAll: (skip = 0, limit = 100) => api.get(`/patients/?skip=${skip}&limit=${limit}`),
  create: (patientData) => api.post('/patients/', patientData),
};

export const imagesAPI = {
  upload: (formData) => api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getByPatient: (patientId) => api.get(`/images/patient/${patientId}`),
};

export const reportsAPI = {
  create: (reportData) => api.post('/reports/', reportData),
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
  update: (reportId, updateData) => api.put(`/reports/${reportId}`, updateData),
};

export const analysisAPI = {
  analyze: (formData) => api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
