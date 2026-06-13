import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import RegisterPage from './pages/RegisterPage';
import SignInPage from './pages/SignInPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';

import './App.css';

function App() {
  const { isLoggedIn } = useAuth();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const location = useLocation();

  const handlePostCreated = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="app-container">
      <Navbar />

      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage key={refreshKey} />} />
            <Route
              path="/create"
              element={isLoggedIn ? <CreatePostPage onPostCreated={handlePostCreated} /> : <Navigate to="/signin" replace />}
            />
            <Route path="/blogs/:id" element={<BlogPage />} />
            <Route
              path="/edit/:id"
              element={isLoggedIn ? <EditPostPage /> : <Navigate to="/signin" replace />}
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} Blogora. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
