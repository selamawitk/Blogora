import api from './api';

/**
 * Register new user
 * @param {object} param0
 * @param {string} param0.email
 * @param {string} param0.username
 * @param {string} param0.password
 * @returns {Promise<object>} User data or throws error
 */
export async function register({ email, username, password }) {
  const response = await api.post('/auth/register', { email, username, password });
  return response.data;
}

/**
 * Sign in existing user
 * @param {object} param0
 * @param {string} param0.email
 * @param {string} param0.password
 * @returns {Promise<object>} User data (including token) or throws error
 */
export async function signIn({ email, password }) {
  const response = await api.post('/auth/signin', { email, password });
  return response.data;
}
