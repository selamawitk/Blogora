import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Ensure this matches your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies/sessions if you use them (even if not for JWT directly, good practice)
});

/**
 * Sets the Authorization header for all subsequent Axios requests.
 * @param {string | null} token The JWT token, or null to remove the header.
 */
export const setAuthToken = (token) => {
  if (token) {
    // Apply the token to all requests if it exists
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Delete the auth header if no token is provided (e.g., on logout)
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;