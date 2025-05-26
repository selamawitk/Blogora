import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function BlogCard({ blog }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="card mb-4"
      style={{
        border: 'none',
        borderRadius: '1.5rem',
        padding: '1rem',
        background: 'linear-gradient(135deg,rgb(2, 38, 67) 70%, #0FCAEB 130%)',
        backdropFilter: 'blur(6px)',
        color: '#e2f1f5',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="card-body">
        <h5
          className="card-title"
          style={{
            background: 'linear-gradient(45deg, #0dcaf0, #6610f2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            display: 'inline-block',
          }}
        >
          {blog.title}
        </h5>

        <p
          className="card-text"
          style={{
            color: '#cbd6e2',
            fontSize: '1rem',
            lineHeight: '1.6',
            maxHeight: '6rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {blog.content}
        </p>

        <motion.div whileHover={{ scale: 1.05 }} className="mt-3">
          <Link
            to={`/blogs/${blog._id}`}
            className="btn btn-sm"
            style={{
              borderRadius: '30px',
              backgroundColor: '#0FCAEB',
              color: '#00121e',
              fontWeight: 600,
              padding: '0.5rem 1.2rem',
              border: 'none',
              boxShadow: '0 0 14px rgba(15, 202, 235, 0.5)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0abed8';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(15, 202, 235, 0.7)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0FCAEB';
              e.currentTarget.style.color = '#00121e';
              e.currentTarget.style.boxShadow = '0 0 14px rgba(15, 202, 235, 0.5)';
            }}
          >
            Read More
          </Link>
        </motion.div>
      </div>

      <div
        className="card-footer small"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          color: '#8fa6b8',
        }}
      >
        Posted on {new Date(blog.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}

export default BlogCard;
