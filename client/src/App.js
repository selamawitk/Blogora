import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';

import RegisterPage from './pages/RegisterPage';  // You will create this
import SignInPage from './pages/SignInPage';      // You will create this

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Refresh key to refresh homepage posts after creating a post
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Handler for successful login/register
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Handler for logout
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 app-container">
        {/* Pass isLoggedIn and logout handler to Navbar */}
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        <main className="container flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<HomePage key={refreshKey} />} />
            <Route 
              path="/create" 
              element={
                isLoggedIn ? (
                  <CreatePostPage onPostCreated={handlePostCreated} />
                ) : (
                  <Navigate to="/signin" replace />
                )
              } 
            />
            <Route path="/blogs/:id" element={<BlogPage />} />
            <Route 
              path="/edit/:id" 
              element={
                isLoggedIn ? (
                  <EditPostPage />
                ) : (
                  <Navigate to="/signin" replace />
                )
              } 
            />

            {/* Register and SignIn routes */}
            <Route 
              path="/register" 
              element={<RegisterPage onRegister={handleLogin} />} 
            />
            <Route 
              path="/signin" 
              element={<SignInPage onSignIn={handleLogin} />} 
            />

            {/* Optional: Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="footer">
          &copy; {new Date().getFullYear()} Modern MERN Blog. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}

export default App;
