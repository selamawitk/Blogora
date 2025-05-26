import React from 'react';
import { motion } from 'framer-motion';

const CommentCard = ({ comment }) => {
  const username = comment.user?.username || 'Anonymous';
  const commentContent = comment.content || 'No content';
  const commentDate = comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Unknown date';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        marginBottom: '1rem',
        background: 'linear-gradient(135deg, rgb(1, 35, 59) 70%, rgb(4, 75, 114) 130%)',
        padding: '1rem 1.2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
        color: '#e2f1f5',
      }}
    >
      <strong style={{ color: '#0FCAEB' }}>{username}</strong>
      <p style={{ margin: '0.5rem 0', color: '#d3e3ec', whiteSpace: 'pre-wrap' }}>{commentContent}</p>
      <small style={{ color: '#999' }}>{commentDate}</small>
    </motion.div>
  );
};

export default CommentCard;