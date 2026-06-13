import React, { createContext, useState, useEffect, useContext } from 'react';
import { setAuthToken } from '../services/api'; // Import the new helper function

// Export AuthContext directly
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setAuthToken(parsedUser.token || savedToken);
      } else if (savedToken) {
        setAuthToken(savedToken);
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setAuthToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Set the token immediately upon successful login
    setAuthToken(userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Clear the token from Axios headers on logout
    setAuthToken(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isLoggedIn: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}