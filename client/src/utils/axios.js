import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Condition to check if token expired and we haven't retried yet
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/register')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
            { refreshToken }
          );
          
          if (res.data.success) {
            localStorage.setItem('accessToken', res.data.data.accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.data.accessToken}`;
            originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logical action is to log out
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Better dispatch event or use callback rather than direct window modification if possible
          // But as a fallback:
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
