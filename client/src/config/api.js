import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

API.interceptors.request.use((config) => {
  if (!config) return config;
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const retryDelay = (count) => new Promise((resolve) => setTimeout(resolve, 1000 * count));

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    const status = error?.response?.status;

    if (status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      return Promise.reject(error);
    }

    if (!config) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= 2) {
      return Promise.reject(error);
    }

    if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      config.__retryCount += 1;
      await retryDelay(config.__retryCount);
      return API(config);
    }

    return Promise.reject(error);
  },
);

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
};

export default API;
