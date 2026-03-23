import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

const TOKEN_KEY = 'flexiToken';

const ApiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Separate instance for long-running requests (AI diet planning, etc.)
const LongTimeoutApiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for AI-powered endpoints
});

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

ApiService.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add same interceptor to long-timeout service
LongTimeoutApiService.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error, fallback = 'Something went wrong.') => {
  if (!error?.response) {
    return 'Our servers are doing some heavy lifting right now. Please try again in a minute.';
  }

  return error.response?.data?.message || error.response?.data?.error || fallback;
};

// Authentication / Users API
export const authApi = {
  register: (payload) => ApiService.post('/users/register', payload),
  login: (email, password) => ApiService.post('/users/login', { email, password }),
  getMembers: () => ApiService.get('/users/all', { params: { role: 'MEMBER' } }),
  addMember: (payload) => ApiService.post('/users/trainer/add-member', payload),
  removeMember: (memberId) => ApiService.delete(`/users/trainer/remove-member/${memberId}`),
};

// Health Metrics API
export const healthApi = {
  saveMetrics: (payload) => ApiService.post('/health/save', payload),
  getMetrics: (userId) => ApiService.get(`/health/user/${userId}`),
};

// Appointments API
export const appointmentsApi = {
  bookAppointment: (payload) => ApiService.post('/appointments/book', payload),
  getAllAppointments: () => ApiService.get('/appointments/all'),
};

export const trainerApi = {
  getMyLeaveBlocks: () => ApiService.get('/trainer/leave-blocks'),
  getAllLeaveBlocks: () => ApiService.get('/trainer/leave-blocks/all'),
  addLeaveBlock: (payload) => ApiService.post('/trainer/leave-blocks', payload),
  removeLeaveBlock: (id) => ApiService.delete(`/trainer/leave-blocks/${id}`),
};

// Nutrition API
export const nutritionApi = {
  generateDietPlan: (payload) => LongTimeoutApiService.post('/nutrition/diet-plan', payload),
  getApiStatus: () => ApiService.get('/nutrition/api-status'),
};

export default ApiService;
