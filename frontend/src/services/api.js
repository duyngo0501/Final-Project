import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Games API
export const gamesAPI = {
  getAllGames: (page = 1, limit = 10) => 
    api.get(`/games?page=${page}&limit=${limit}`),
  getGameById: (id) => api.get(`/games/${id}`),
  createGame: (gameData) => api.post('/games', gameData),
  updateGame: (id, gameData) => api.put(`/games/${id}`, gameData),
  deleteGame: (id) => api.delete(`/games/${id}`),
};

export default api; 