import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LogIn, BookOpen } from 'lucide-react';

function NotFoundPage() {
  return (
    <motion.div
      className="notfound-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card">
        <span className="badge-pill badge-secondary mb-3">404 · Page not found</span>
        <h1>Lost in the blogosphere?</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
          The page you are looking for does not exist, but there are plenty of stories waiting to be discovered.
        </p>
        <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
          <Link to="/" className="hero-cta-btn" style={{ display: 'inline-flex' }}>
            <Home size={16} />
            Explore the homepage
          </Link>
          <Link to="/signin" className="hero-cta-btn hero-cta-outline" style={{ display: 'inline-flex' }}>
            <LogIn size={16} />
            Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default NotFoundPage;
