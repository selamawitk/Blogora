import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import BlogCard from '../components/BlogCard';
import api from '../services/api';

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      loop: Infinity,
      ease: 'linear',
      duration: 1,
    },
  },
};

const titleVariants = {
  initial: { y: -40, opacity: 0, scale: 0.97 },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1.01,
    textShadow: `
      0 0 6px #26c6da,   /* bright cyan */
      0 0 12px #00acc1,  /* deeper teal */
      0 0 18px #00bcd4,  /* subtle glow */
      0 0 24px #00838f   /* dark teal for depth */
    `,
    transition: {
      type: 'spring',
      stiffness: 130,
      damping: 12,
      repeat: Infinity,
      repeatType: "reverse",
      duration: 2.5,
    },
  },
};

function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('HomePage: Fetching blog posts...');
        const res = await api.get('/posts');
        console.log('HomePage: Fetched blog posts:', res.data);
        setBlogs(res.data);
      } catch (err) {
        console.error('HomePage: Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="container py-5">
      <motion.h1
        className="display-3 text-center mb-5 fw-bold"
        variants={titleVariants}
        initial="initial"
        animate="animate"
      >
        Welcome to Our Blog
      </motion.h1>

      {loading ? (
        <motion.div
          className="d-flex flex-column align-items-center justify-content-center my-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="spinner-border text-primary"
            style={{ width: '3rem', height: '3rem' }}
            role="status"
            variants={spinnerVariants}
            animate="animate"
          >
            <span className="visually-hidden">Loading...</span>
          </motion.div>
          <p className="mt-3 fs-5 text-muted">Fetching exciting stories...</p>
        </motion.div>
      ) : error ? (
        <div className="alert custom-alert-danger text-center my-5 animate__animated animate__fadeInUp" role="alert">
          <h4 className="alert-heading">Oops! Something went wrong.</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please refresh the page or try again later.</p>
        </div>
      ) : blogs.length === 0 ? (
        <motion.p
          className="text-center fs-4 text-muted my-5 animate__animated animate__fadeInUp"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No blog posts found. Be the first to share your story!
        </motion.p>
      ) : (
        <div className="row g-4 justify-content-center">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 10,
                delay: index * 0.1,
              }}
            >
              <BlogCard blog={blog} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
