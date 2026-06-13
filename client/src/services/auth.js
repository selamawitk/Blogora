import api from './api';

export async function register({ email, username, password }) {
  const response = await api.post('/auth/register', { email, username, password });
  return response.data;
}

export async function signIn({ email, password }) {
  const response = await api.post('/auth/signin', { email, password });
  return response.data;
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword({ token, password }) {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
}

export async function updateProfile(profileData) {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
}
